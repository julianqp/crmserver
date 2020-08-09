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

  type Query {
    ## USUARIO
    # Obtener un usuario
    obtenerUsuario: Usuario
    ## CLIENTE
    # Obtener los clientes de un vendedor
    obtenerClientesVendedor: [Cliente]
    #Obtiene la informacion de un cliente
    obtenerCliente(id: ID!): Cliente
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
  }
`;

module.exports = typeDefs;
