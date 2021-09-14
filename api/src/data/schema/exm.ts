export const types = `
  type Exm {
    _id: String
    name: String
    features: JSON
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

const commonParams = `
  name: String,
  features: JSON
`;

export const mutations = `
  exmsAdd(${commonParams}): Exm
  exmsEdit(_id: String, ${commonParams}): Exm
  exmsRemove(_id: String!): JSON
`;
