export const types = `
  type Uom {
    _id: String!
    name: String
    code: String
    createdAt: Date
  }
`;

const params = `
  name: String,
  code: String
`;

export const queries = `
  uoms: [Uom]
  uomsTotalCount: Int
`;

export const mutations = `
  uomsAdd(${params}): Uom
  uomsEdit(_id: String!, ${params}): Uom
  uomsRemove(uomIds: [String!]): String
`;
