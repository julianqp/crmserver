const { gql } = require("apollo-server");

const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellidos: String
    email: String
    creado: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellidos: String
    email: String
    empresa: String
    telefono: String
    vendedor: String
    creado: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
  }

  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: Cliente
    vendedor: ID
    fecha: String
    estado: EstadoPedido
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }

  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }

  type Token {
    token: String
  }

  input UsuarioInput {
    nombre: String
    apellidos: String
    email: String
    password: String
  }

  input ClienteInput {
    nombre: String!
    apellidos: String!
    email: String!
    empresa: String
    telefono: String
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Int!
  }

  input PedidoProductoInput {
    id: ID
    cantidad: Int
    nombre: String
    precio: Float
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
  }

  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  type Query {
    ## USUARIO
    # Obtener un usuario
    obtenerUsuario: Usuario

    ## CLIENTE
    # Obtener los clientes de un vendedor
    obtenerClientesVendedor: [Cliente]
    #Obtiene la informacion de un cliente
    obtenerCliente(id: ID!): Cliente

    ## PRODUCTO
    # Obtiene la informacion de los productos
    obtenerProductos: [Producto]
    # Obtiene la informacion de un producto
    obtenerProducto(id: ID!): Producto

    ## Pedidos
    # Obtiene todos los pedidos
    obtenerPedidos: [Pedido]
    # Obtiene todos los pedidos de un vendedos
    obtenerPedidosVendedor: [Pedido]
    # Obtiene la informacion de un pedido
    obtenerPedido(id: ID!): Pedido
    # Obtiene los productos segun un estado
    obtenerPedidosEstado(estado: String!): [Pedido]

    ## Busquedas Avanzadas
    # Devuelve los daors de los mejores clientes
    mejoresClientes: [TopCliente]
    # Devuelve los daors de los mejores vendedores
    mejoresVendedores: [TopVendedor]
    # Realiza la búsqueda de productos según nombre
    buscarProducto(texto: String!): [Producto]
  }
  type Mutation {
    ## USUARIO
    # Creación de nuevo usuario
    nuevoUsuario(input: UsuarioInput!): Usuario
    # Login
    login(email: String!, password: String!): Token

    ## CLIENTE
    # Creacion de un nuevo cliente
    nuevoCliente(input: ClienteInput!): Cliente
    # Actualiza un cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    # Eliminar a un cliente
    eliminarCliente(id: ID!): String

    ## PRODUCTO
    # Crea un nuevo producto
    nuevoProducto(input: ProductoInput): Producto
    # Actualiza la información del producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    # Elimina el producto
    eliminarProducto(id: ID!): String

    ## PEDIDO
    # Crea un nuevo pedido
    nuevoPedido(input: PedidoInput): Pedido
    # Actualiza la informacion de un pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    # Elimina un pedido
    eliminarPedido(id: ID!): String
  }
`;

module.exports = typeDefs;
