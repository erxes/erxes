const externalId = '_id: String! @external';
const keyFields = '@key(fields: "_id")';

export const types = _serviceDiscovery => {
  return `
    extend type User ${keyFields} {
      ${externalId}
    }

    input AttachmentInput {
      url: String!
      name: String!
      type: String
      size: Float
      duration: Float
    }

    type ExmAppearance {
      primaryColor: String
      secondaryColor: String
      bodyColor: String
      headerColor: String
      footerColor: String
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
      webName: String
      webDescription: String
      description: String
      logo: JSON
      url: String
      favicon: JSON
      features: [ExmFeature]
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
      bodyColor: String
      headerColor: String
      footerColor: String
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
};

export const queries = `
  exms(name: String, page: Int, perPage: Int): ExmList
  exmGet: Exm
`;

const commonParams = `
  name: String
  description: String
  webName: String
  webDescription: String
  url: String
  features: [ExmFeatureInput]
  logo: AttachmentInput
  favicon: AttachmentInput
  appearance: ExmAppearanceInput
`;

export const mutations = `
  exmsAdd(${commonParams}): Exm
  exmsEdit(_id: String, ${commonParams}): Exm
  exmsRemove(_id: String!): JSON
  userRegistrationCreate(email:String, password:String): User
`;
