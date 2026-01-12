import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type MenuItem {
    _id: String!
    parentId: String
    parent: MenuItem
    clientPortalId: String!
    label: String
    objectType: String
    objectId: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
  }

  type MenuItemResponse {
    list: [MenuItem]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const inputs = `
  input MenuItemInput {
    parentId: String
    clientPortalId: String
    label: String
    objectType: String
    objectId: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
  }
`;

export const queries = `
    cmsMenuList(clientPortalId: String, kind: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [MenuItem]
    cmsMenu(_id: String!, language: String): MenuItem

    cpMenus(language: String, kind: String): [MenuItem]
`;

export const mutations = `
    cmsAddMenu(input: MenuItemInput!): MenuItem
    cmsEditMenu(_id: String!, input: MenuItemInput!): MenuItem
    cmsRemoveMenu(_id: String!): JSON
`;
