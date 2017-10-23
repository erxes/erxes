export const types = `
  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date
  }
`;

export const mutations = `
  formsAdd(title: String!, description: String): Form
  formsEdit(_id: String!, title: String!, description: String): Form
  formsRemove(_id: String!): String
  formsDuplicate(_id: String!): Form
`;

export const queries = `
  forms(limit: Int): [Form]
  formDetail(_id: String!): Form
  formsTotalCount: Int
`;
