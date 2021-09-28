export const types = `
  type ExmWelcomeContent {
    _id: String
    title: String
    content: String
  }

  type Exm {
    _id: String
    name: String
    description: String
    logo: Attachment
    features: JSON
    welcomeContent: [ExmWelcomeContent]
    createdAt: Date
    createdBy: String
  }

  type ExmList {
    list: [Exm]
    totalCount: Int
  }

  input ExmWelcomeContentInput {
    _id: String
    title: String
    content: String
  }
`;

export const queries = `
  exms(name: String, page: Int, perPage: Int): ExmList
  exmDetail(_id: String!): Exm
  exmGetLast: Exm
`;

const commonParams = `
  name: String
  description: String
  features: JSON
  logo: AttachmentInput
  welcomeContent: [ExmWelcomeContentInput]
`;

export const mutations = `
  exmsAdd(${commonParams}): Exm
  exmsEdit(_id: String, ${commonParams}): Exm
  exmsRemove(_id: String!): JSON
`;
