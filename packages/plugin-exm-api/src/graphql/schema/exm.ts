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
      categoryId: String
      logo: JSON
      url: String
      favicon: JSON
      features: [ExmFeature]
      appearance: ExmAppearance
      vision: String
      structure: String
      createdAt: Date
      createdBy: String
    }

    type ExmCoreCategory  {
      _id:String,
      name:String,
      description:String,
      parentId:String,
      code:String,
      order:String,
      count:Int,
      isRoot:Boolean,
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

const commonQueryParams = `
    ids:[String],
    excludeIds:[String],
    searchValue:String,
`;

export const queries = `
  exms(searchValue: String, categoryId: String, page: Int, perPage: Int): ExmList
  exmDetail(_id:String!): Exm
  exmGet: Exm
  exmCoreCategories(${commonQueryParams}): [ExmCoreCategory]
  exmCoreCategoriesTotalCount(${commonQueryParams}): Int
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
  vision: String
  structure: String
  categoryId: String
`;

const commonMutationParams = `
  name:String,
  description:String,
  parentId:String,
  code:String
`;

export const mutations = `
  exmsAdd(${commonParams}): Exm
  exmsEdit(_id: String, ${commonParams}): Exm
  exmsRemove(_id: String!): JSON
  exmCoreCategoryAdd(${commonMutationParams}):JSON
  exmCoreCategoryUpdate(_id:String,${commonMutationParams}):JSON
  exmCoreCategoryRemove(_id:String):JSON
  userRegistrationCreate(email:String, password:String): User
`;
