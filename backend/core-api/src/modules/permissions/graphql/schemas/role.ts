import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum ROLE {
    owner
    admin
    member
  }

  type Role {
    user: User
    role: ROLE

    cursor: String
  }

  type RoleListResponse {
    list: [Role]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  userId: String,
  role: ROLE,

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  roles(${queryParams}): RoleListResponse
`;

const mutationParams = `
  userId: String!,
  role: ROLE!
`;

export const mutations = `
  rolesUpsert(${mutationParams}): Role
`;
