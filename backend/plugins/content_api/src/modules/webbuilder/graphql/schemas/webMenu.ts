import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type WebMenuItem {
    _id: String!
    parentId: String
    parent: WebMenuItem
    webId: String!
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

  type WebMenuItemResponse {
    list: [WebMenuItem]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const inputs = `
  input WebMenuItemInput {
    parentId: String
    webId: String
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
    cpWebMenuList(webId: String!, kind: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [WebMenuItem]
    cpWebMenu(_id: String!, language: String): WebMenuItem
    cpWebMenus(webId: String!, language: String, kind: String): [WebMenuItem]
`;

export const mutations = `
    cpWebAddMenu(input: WebMenuItemInput!): WebMenuItem
    cpWebEditMenu(_id: String!, input: WebMenuItemInput!): WebMenuItem
    cpWebRemoveMenu(_id: String!): JSON
`;
