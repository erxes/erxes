export const types = `
  type Exm {
    _id: String
    name: String
    createdAt: Date
    createdBy: String
  }

  type ExmList {
    list: [Exm]
    totalCount: Int
  }
`;

export const queries = `
  exms(name: String, page: Int, perPage: Int): ExmList
  exmDetail(_id: String!): Exm
  exmGetLast: Exm
`;

export const mutations = `
  exmsAdd(name: String!): Exm
  exmsEdit(_id: String, name: String): Exm
  exmsRemove(_id: String!): JSON
`;
