export const types = () => `
  type Purpose {
    _id: String!
    name: String
    parentId: String
    order: String!
    code: String
    isRoot: Boolean
    description: String
    createdAt: Date
  }

  type purposesMainResponse {
    list: [Purpose],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  hasParentId: Boolean
  searchValue: String
`;

export const queries = `
  purposesMain(${queryParams}): purposesMainResponse
`;

const commonFields = `
  name: String
  parentId: String
  code: String
  description: String
  searchValue: String
`;

export const mutations = `
  purposeAdd(${commonFields}): Purpose
  purposeEdit(_id: String!, ${commonFields}): Purpose
  purposesRemove(purposeIds: [String]): [String]
`;
