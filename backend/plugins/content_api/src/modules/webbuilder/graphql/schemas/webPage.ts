import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type WebPageItem {
    _id: String!
    name: String
    type: String
    content: String
    order: Int
    contentType: String
    contentTypeId: String
    config: JSON
  }

  type WebPage {
    _id: String!
    webId: String!
    clientPortalId: String!
    name: String
    description: String
    coverImage: String
    type: String
    slug: String
    content: String
    createdUserId: String
    createdUser: User
    createdAt: Date
    updatedAt: Date
    pageItems: [WebPageItem]
    customFieldsData: JSON
    customFieldsMap: JSON
    translations: [Translation]
  }

  type WebPageList {
    pages: [WebPage]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

export const inputs = `
  input WebPageItemInput {
    name: String
    type: String
    content: String
    order: Int
    contentType: String
    contentTypeId: String
    config: JSON
  }

  input WebPageInput {
    webId: String
    language: String
    name: String
    description: String
    coverImage: String
    status: String
    type: String
    slug: String
    content: String
    pageItems: [WebPageItemInput]
    customFieldsData: JSON
    translations: [TranslationInput]
  }
`;

export const queries = `
  cpWebPage(_id: String, slug: String, language: String, webId: String): WebPage
  cpWebPages(webId: String!, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): [WebPage]
  cpWebPageList(webId: String!, searchValue: String, language: String, ${GQL_CURSOR_PARAM_DEFS}): WebPageList
`;

export const mutations = `
  cpWebPagesAdd(input: WebPageInput!): WebPage
  cpWebPagesEdit(_id: String!, input: WebPageInput!): WebPage
  cpWebPagesRemove(_id: String!): JSON
`;
