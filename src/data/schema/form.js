export const types = `
  type Form {
    _id: String!
    title: String
    code: String
    description: String
    createdUserId: String
    createdDate: Date

    fields: [FormField]
  }

  type FormField {
    _id: String!
    formId: String
    type: String
    validation: String
    text: String
    description: String
    options: [String]
    isRequired: Boolean
    order: Int
  }
`;

export const queries = `
  forms(limit: Int): [Form]
  formDetail(_id: String!): Form
  formsTotalCount: Int
`;
