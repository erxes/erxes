export const types = `
  extend type Field @key(fields: "_id") {
    _id: String! @external
  }

  type CustomPostType {
    _id: String!
    clientPortalId: String!
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

  type CustomFieldGroup {
    _id: String!
    clientPortalId: String!
    parentId: String
    label: String!
    code: String
    order: Int
    createdAt: Date

    customPostTypeIds: [String]
    customPostTypes: [CustomPostType]

    enabledPageIds: [String]
    enabledCategoryIds: [String]

    fields: [Field]
  }

  type CustomFieldGroupResponse {
        list: [CustomFieldGroup]
        totalCount: Int
        totalPages: Int
        currentPage: Int
  }
  
`;

export const inputs = `
  input CustomPostTypeInput {
    label: String!
    pluralLabel: String!
    code: String!
    
    description: String

    clientPortalId: String!
  }

  input CustomFieldGroupInput {
    label: String!
    code: String
    order: Int
    parentId: String
    clientPortalId: String!
    customPostTypeIds: [String]
    enabledPageIds: [String]
    enabledCategoryIds: [String]
  }
`;

export const queries = `
  cmsCustomPostTypeList(clientPortalId: String, searchValue: String, page: Int, perPage: Int): CustomPostTypeResponse
  cmsCustomPostTypes(clientPortalId: String, searchValue: String, page: Int, perPage: Int): [CustomPostType]
  cmsCustomPostType(_id: String): CustomPostType

  cmsCustomFieldGroupList(clientPortalId: String!, searchValue: String, page: Int, perPage: Int): CustomFieldGroupResponse
  cmsCustomFieldGroups(clientPortalId: String!, pageId: String, categoryId: String, postType: String, searchValue: String, page: Int, perPage: Int): [CustomFieldGroup]
  cmsCustomFieldGroup(_id: String): CustomFieldGroup
`;

export const mutations = `
  cmsCustomPostTypesAdd(input: CustomPostTypeInput!): CustomPostType
  cmsCustomPostTypesEdit(_id: String!, input: CustomPostTypeInput!): CustomPostType
  cmsCustomPostTypesRemove(_id: String!): JSON

  cmsCustomFieldGroupsAdd(input: CustomFieldGroupInput!): CustomFieldGroup
  cmsCustomFieldGroupsEdit(_id: String!, input: CustomFieldGroupInput!): CustomFieldGroup
  cmsCustomFieldGroupsRemove(_id: String!): JSON
`;
