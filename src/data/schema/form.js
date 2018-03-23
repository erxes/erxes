export const types = `
  type Form {
    _id: String!
    title: String
    code: String
    description: String
    callout: Callout
    createdUserId: String
    createdDate: Date
    viewCount: Int
    conversationRate: Int
    contactsGathered: Int
  }

  type Callout {
    title: String
    description: String
    buttonText: String
    themeColor: String
    featuredImage: String
  }

  input CalloutParams {
    title: String,
    description: String,
    buttonText: String,
    themeColor: String,
    featuredImage: String
  }
`;

const commonFields = `
  title: String!,
  description: String,
  callout: CalloutParams
`;

export const mutations = `
  formsAdd(${commonFields}): Form
  formsEdit(_id: String!, ${commonFields} ): Form
  formsRemove(_id: String!): String
  formsDuplicate(_id: String!): Form
`;

export const queries = `
  forms(page: Int, perPage: Int): [Form]
  formDetail(_id: String!): Form
  formsTotalCount: Int
`;
