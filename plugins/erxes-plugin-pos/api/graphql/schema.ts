export const types = `
  type Pos {
    _id: String
    name: String
    description: String
    createdAt: Date
  }

  type PosConfig {
    _id: String
    posId: String
    code: String
    value: JSON
  }

  type ProductGroups {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  allPos: [Pos]
  posConfigs(posId: String!): [PosConfig]
`;

export const mutations = `
  posAdd(
    name: String description: String
  ): Pos

  posEdit(
    _id: String name: String description: String
  ): Pos

  posRemove(_id: String!): JSON

  posConfigsUpdate(configsMap: JSON!): JSON
`;