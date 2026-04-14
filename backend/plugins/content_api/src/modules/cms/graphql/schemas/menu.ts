import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type MenuItem {
    _id: String!
    parentId: String
    parent: MenuItem
    clientPortalId: String!
    webId: String
    label: String
    contentType: String
    contentTypeId: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
    translations: [Translation]
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
    webId: String
    label: String
    contentType: String
    contentTypeId: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
    language: String
    translations: [TranslationInput]
  }
`;

export const queries = `
    cmsMenus(clientPortalId: String!, kind: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [MenuItem]
    cmsMenuList(clientPortalId: String, kind: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [MenuItem]
    cmsMenu(_id: String!, language: String, clientPortalId: String!): MenuItem

    cpMenus(language: String, kind: String, webId: String): [MenuItem]
    cpCmsMenuList(clientPortalId: String, kind: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [MenuItem]
`;

export const mutations = `
    cmsAddMenu(input: MenuItemInput!): MenuItem
    cmsEditMenu(_id: String!, input: MenuItemInput!): MenuItem
    cmsRemoveMenu(_id: String!): JSON

    cpCmsAddMenu(input: MenuItemInput!): MenuItem
    cpCmsEditMenu(_id: String!, input: MenuItemInput!): MenuItem
    cpCmsRemoveMenu(_id: String!): JSON
`;
