export const types = `
  type ExmWelcomeContent {
    _id: String
    title: String
    image: Attachment
    content: String
  }

  type ExmAppearance {
    primaryColor: String
    secondaryColor: String
  }

  type ExmFeature {
    _id: String
    icon: String
    name: String
    description: String
    contentType: String
    contentId: String
    subContentId: String
  }

  type Exm {
    _id: String
    name: String
    description: String
    logo: Attachment
    features: [ExmFeature]
    welcomeContent: [ExmWelcomeContent]
    appearance: ExmAppearance
    createdAt: Date
    createdBy: String
  }

  type ExmList {
    list: [Exm]
    totalCount: Int
  }

  input ExmAppearanceInput {
    primaryColor: String
    secondaryColor: String
  }

  input ExmWelcomeContentInput {
    _id: String
    title: String
    image: AttachmentInput
    content: String
  }

  input ExmFeatureInput {
    _id: String
    icon: String
    name: String
    description: String
    contentType: String
    contentId: String
    subContentId: String
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
  features: [ExmFeatureInput]
  logo: AttachmentInput
  welcomeContent: [ExmWelcomeContentInput]
  appearance: ExmAppearanceInput
`;

export const mutations = `
  exmsAdd(${commonParams}): Exm
  exmsEdit(_id: String, ${commonParams}): Exm
  exmsRemove(_id: String!): JSON
`;
