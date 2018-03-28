export const types = `
  type Form {
    _id: String!
    title: String
    code: String
    description: String
    buttonText: String
    themeColor: String
    featuredImage: String
    createdUserId: String
    createdDate: Date
    viewCount: Int
    contactsGathered: Int
  }
`;

const commonFields = `
  title: String!,
  description: String,
  buttonText: String,
  themeColor: String,
  featuredImage: String,
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
`;

export const queries = `
  forms(page: Int, perPage: Int): [Form]
  formDetail(_id: String!): Form
  formsTotalCount: Int
`;
