import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type UsersGroup {
    _id: String!
    name: String!
    description: String
    memberIds: [String]
    members: [User]
    branchIds: [String]
    departmentIds:[String]

    cursor: String
  }

  type UsersGroupListResponse {
    list: [UsersGroup]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queriesParams = `
  searchValue: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  usersGroups(${queriesParams}): UsersGroupListResponse
  usersGroupsTotalCount: Int
`;

const mutationParams = `
  name: String!,
  description: String,
  memberIds: [String],
  branchIds: [String],
  departmentIds: [String],
`;

export const mutations = `
  usersGroupsAdd(${mutationParams}): UsersGroup
  usersGroupsEdit(_id: String!, ${mutationParams}): UsersGroup
  usersGroupsRemove(_id: String!): JSON
  usersGroupsCopy(_id: String!, memberIds: [String]): UsersGroup
`;
