import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type CustomTourType {
    _id: String!
    branchId: String!
    code: String!
    label: String!
    pluralLabel: String!
    description: String
    isActive: Boolean
    createdAt: Date
  }

  type CustomTourTypeResponse {
    list: [CustomTourType]
    totalCount: Int
    pageInfo: PageInfo
  }

  type CustomTourFieldGroup {
    _id: String!
    branchId: String!
    parentId: String
    label: String!
    code: String
    order: Int
    createdAt: Date

    customTourTypeIds: [String]
    customTourTypes: [CustomTourType]
    enabledTourIds: [String]

    fields: JSON
  }

  type CustomTourFieldGroupResponse {
    list: [CustomTourFieldGroup]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const inputs = `
  input CustomTourTypeInput {
    label: String!
    pluralLabel: String!
    code: String!
    description: String
    branchId: String
  }

  input CustomTourFieldGroupInput {
    label: String!
    code: String
    order: Int
    parentId: String
    branchId: String
    customTourTypeIds: [String]
    enabledTourIds: [String]
    fields: JSON
  }
`;

export const queries = `
  bmsCustomTourTypeList(branchId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): CustomTourTypeResponse
  bmsCustomTourTypes(branchId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): [CustomTourType]
  bmsCustomTourType(_id: String): CustomTourType

  bmsCustomTourGroupList(branchId: String!, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): CustomTourFieldGroupResponse
  bmsCustomTourGroups(branchId: String!, tourType: String, tourId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): [CustomTourFieldGroup]
  bmsCustomTourGroup(_id: String): CustomTourFieldGroup
`;

export const mutations = `
  bmsCustomTourTypesAdd(input: CustomTourTypeInput!): CustomTourType
  bmsCustomTourTypesEdit(_id: String!, input: CustomTourTypeInput!): CustomTourType
  bmsCustomTourTypesRemove(_id: String!): JSON

  bmsCustomTourGroupsAdd(input: CustomTourFieldGroupInput!): CustomTourFieldGroup
  bmsCustomTourGroupsEdit(_id: String!, input: CustomTourFieldGroupInput!): CustomTourFieldGroup
  bmsCustomTourGroupsRemove(_id: String!): JSON
`;
