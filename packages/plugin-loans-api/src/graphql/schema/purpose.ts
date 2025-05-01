export const types = () => `
  type Purpose {
    _id: String!
    name: String
    parentId: String
    code: String
    description: String
    createdAt: Date
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  parentId: String
`;

export const queries = `
  purposes(${queryParams}): [Purpose]
`;

const commonFields = `
  name: String
  parentId: String
  code: String
  description: String
`;

export const mutations = `
  purposeAdd(${commonFields}): Purpose
  purposeEdit(_id: String!, ${commonFields}): Purpose
  purposesRemove(puposeIds: [String]): [String]
`;
