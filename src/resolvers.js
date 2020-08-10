// Importamos los modelos
const Usuario = require("../models/Usuario");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");

// importamos las librerias necesarias
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findById } = require("../models/Usuario");
const Pedido = require("../models/Pedido");
require("dotenv").config({ path: "variables.env" });

// Funcion que crea un token de autenticacion
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apellido } = usuario;

  return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, ctx) => {
      if (!ctx.usuario) {
        throw new Error("Falta token usuario");
      }
      const { id } = ctx.usuario;
      const usuario = await Usuario.findById(id);

      if (!usuario) {
        throw new Error("El usuario no existe");
      }
      return usuario;
    },
    obtenerClientesVendedor: async (_, {}, ctx) => {
      // Devolvemos error si no nos llega vendedor
      if (!ctx.usuario) {
        throw new Error("Sin autorización");
      }
      // Buscamos los clientes registrados por el vendedor
      try {
        const resultado = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return resultado;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      // Revisamos si existe el cliente
      const existeCliente = await Cliente.findById(id);

      if (!existeCliente) {
        throw new Error("El cliente no existe");
      }
      // Y si el vendedor tiene permisos para ese usuario
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tiene permisos para este cliente.");
      }
      return existeCliente;
    },
    obtenerProductos: async () => {
      // Encuentra todos los productos
      const productos = await Producto.find({});
      // devuelve los productos
      return productos;
    },
    obtenerProducto: async (_, { id }) => {
      // Buscamos si el producto existe
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      // Devolvemos el producto
      return producto;
    },
  },
  Mutation: {
    nuevoUsuario: async (_, { input }) => {
      const { email, password } = input;
      // Buscamos si el usuario existe
      const existeUsurio = await Usuario.findOne({ email });
      if (existeUsurio) {
        throw new Error("El usuario ya está registrado.");
      }
      // Encriptamos la password
      const salto = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salto);
      try {
        // Creamos el usuario y lo almacenamos y lo guardamos en la base de datos
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        // En caso de error devolvemos el error
        throw new Error(error);
      }
    },
    login: async (_, { email, password }) => {
      // Buscamos si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });

      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }
      // Comprobamos si la contraseña es correcta
      const isCorrectPass = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (isCorrectPass) {
        throw new Error("La contraseña es incorrecta");
      }
      // Creamos un nuevo token para el usuario
      const token = crearToken(existeUsuario, process.env.SECRETA, "24h");
      return { token };
    },
    nuevoCliente: async (_, { input }, ctx) => {
      // comprobamos si el cliente ya ha sido registrado
      const { email } = input;

      const existeCliente = await Cliente.findOne({ email });
      if (existeCliente) {
        throw new Error("El cliente ya existe");
      }

      if (!ctx.usuario.id) {
        throw new Error("El vendedor no existe");
      }

      // Se crea el nuevo cliente
      const newCliente = new Cliente(input);
      // Insertamos el vendedor
      newCliente.vendedor = ctx.usuario.id;

      // Insertamos el cliente
      try {
        const resultado = await newCliente.save();
        return resultado;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      // Buscamos si existe el cliente
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("El cliente no existe.");
      }
      // Revisamos si el vendedor tiene los permisos necesarios
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tiene permisos para este cliente.");
      }
      // Actualizamos la información del cliente
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      // Comprobamos si el cliente existe
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        throw new Error("El cliente no existe");
      }
      // Comprobamos si el vendedor tiene permisos
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tiene permisos para este cliente.");
      }
      // Eliminamos el cliente
      await Cliente.findByIdAndDelete({ _id: id });
      return "Cliente eliminado";
    },
    nuevoProducto: async (_, { input }) => {
      try {
        // Creamos el nuevo producto
        const newProducto = new Producto(input);
        // Guardamos el producto en la base de datos
        const producto = await newProducto.save();
        return producto;
      } catch (error) {
        throw new Error(error.nessage);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      // Comprobamos si el producto existe
      let existeProducto = await Producto.findById(id);

      if (!existeProducto) {
        throw new Error("Producto no encotrado.");
      }
      // Actualizamos la información del producto
      existeProducto = await Producto.findByIdAndUpdate({ _id: id }, input, {
        new: true,
      });
      return existeProducto;
    },
    eliminarProducto: async (_, { id }) => {
      // Comprobamos si el producto existe
      let existeProducto = await Producto.findById(id);
      if (!existeProducto) {
        throw new Error("Producto no encotrado.");
      }
      // Eliminamos el producto
      await Producto.findOneAndDelete({ _id: id });
      return "Producto Eliminado";
    },
    nuevoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      // Buscamos si el cliente existe
      let existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("El cliente no existe");
      }
      // Comprobamos si el vendedor tiene permisos en ese cliente
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tiene permisos para este cliente.");
      }

      // Revisamos que el stock este disponible
      for await (const articulo of input.pedido) {
        const { id } = articulo;
        const producto = await Producto.findById(id);
        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo: ${producto.nombre} excede la cantidad disponible`
          );
        } else {
          // Restar la cantidad a la disponible
          producto.existencia = producto.existencia - articulo.cantidad;
          await producto.save();
        }
      }
      // Creamos un nuevo pedido
      let nuevoPedido = new Pedido(input);
      // Asignamos al vendedor
      nuevoPedido.vendedor = ctx.usuario.id;
      // Lo Guardamos en la base de datos
      nuevoPedido = await nuevoPedido.save();
      return nuevoPedido;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { cliente } = input;

      // Comprobamos si el pedido existe
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("El pedido no existe");
      }
      // Comprobamos si el cliente existe
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("El Cliente no existe");
      }
      // Comprobamos si el vendedor tiene permisos en ese cliente
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tiene permisos para este cliente.");
      }

      // Revismos el stock
      if (input.pedido) {
        for await (const articulo of input.pedido) {
          const { id } = articulo;

          const producto = await Producto.findById(id);

          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo: ${producto.nombre} excede la cantidad disponible`
            );
          } else {
            // Actualizamos el stocj
            producto.existencia = producto.existencia - articulo.cantidad;
            await producto.save();
          }
        }
      }
      // Actualisamos el pedido en la base de datos
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return resultado;
    },
    eliminarPedido: async (_, { id }, ctx) => {
      // Comprobamos si existe el pedido
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        throw new Error("El pedido no existe");
      }
      // Comprobamos si el vendedor tiene permisos en ese cliente
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      // Eliminamos el producto de la base d datos
      await Pedido.findOneAndDelete({ _id: id });
      return "Pedido Eliminado";
    },
  },
};

module.exports = resolvers;
