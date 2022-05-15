export const types = `

  type ProductsConfig {
    _id: String!
    code: String!
    value: JSON
  }
`;

export const queries = `
  productsConfigs: [ProductsConfig]
`;

export const mutations = `
  productsConfigsUpdate(configsMap: JSON!): JSON
`;
