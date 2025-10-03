import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `

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
        pageInfo: PageInfo
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

    fields: JSON
  }

  type CustomFieldGroupResponse {
        list: [CustomFieldGroup]
        totalCount: Int
        pageInfo: PageInfo
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
  cmsCustomPostTypeList(clientPortalId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): CustomPostTypeResponse
  cmsCustomPostTypes(clientPortalId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): [CustomPostType]
  cmsCustomPostType(_id: String): CustomPostType

  cmsCustomFieldGroupList(clientPortalId: String!, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): CustomFieldGroupResponse
  cmsCustomFieldGroups(clientPortalId: String!, pageId: String, categoryId: String, postType: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): [CustomFieldGroup]
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
