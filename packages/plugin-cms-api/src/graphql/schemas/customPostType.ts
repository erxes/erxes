export const types = `
  extend type Field @key(fields: "_id") {
    _id: String! @external
  }

  type CustomPostType {
    _id: String!
    clientPortalId: String!
    name: String!
    code: String!
    label: String!
    pluralLabel: String!
    description: String
    createdAt: Date
  }

  type CustomPostTypeResponse {
        list: [CustomPostType]
        totalCount: Int
        totalPages: Int
        currentPage: Int
  }

  
`;

export const inputs = `
  input CustomPostTypeInput {
    name: String!
    label: String!
    pluralLabel: String!
    code: String!
    description: String

    clientPortalId: String!
  }
`;

export const queries = `
  cmsCustomPostTypeList(clientPortalId: String, searchValue: String, page: Int, perPage: Int): CustomPostTypeResponse
  cmsCustomPostTypes(clientPortalId: String, searchValue: String, page: Int, perPage: Int): [CustomPostType]
  cmsCustomPostType(_id: String): CustomPostType
`;

export const mutations = `
  cmsCustomPostTypesAdd(input: CustomPostTypeInput!): CustomPostType
  cmsCustomPostTypesEdit(_id: String!, input: CustomPostTypeInput!): CustomPostType
  cmsCustomPostTypesRemove(_id: String!): JSON
`;
