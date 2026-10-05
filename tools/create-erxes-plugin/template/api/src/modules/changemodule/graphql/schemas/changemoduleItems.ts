export const types = `
  type ChangemoduleItem {
    _id: String!
    name: String!
    code: String!
    status: String
    createdAt: Date
  }
`;

export const queries = `
  changemecChangemoduleItems(status: String): [ChangemoduleItem]
  changemecChangemoduleItem(_id: String!): ChangemoduleItem
`;

const mutationParams = `
  name: String!
  code: String!
  status: String
`;

export const mutations = `
  changemecChangemoduleItemAdd(${mutationParams}): ChangemoduleItem
  changemecChangemoduleItemEdit(_id: String!, ${mutationParams}): ChangemoduleItem
  changemecChangemoduleItemRemove(_id: String!): JSON
`;
