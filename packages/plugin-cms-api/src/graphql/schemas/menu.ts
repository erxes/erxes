export const types = `
  type MenuItem {
    _id: String
    parentId: String
    parent: MenuItem
    clientPortalId: String!
    label: String
    contentType: String
    contentTypeID: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
  }
`

export const inputs = `
  input MenuItemInput {
    parentId: String
    clientPortalId: String
    label: String
    contentType: String
    contentTypeID: String
    kind: String
    icon: String
    url: String
    order: Int
    target: String
  }
`

export const queries = `
    cmsMenuList(clientPortalId: String, kind: String): [MenuItem]
    cmsMenu(_id: String!): MenuItem
`

export const mutations = `
    cmsAddMenu(input: MenuItemInput!): MenuItem
    cmsEditMenu(_id: String!, input: MenuItemInput!): MenuItem
    cmsRemoveMenu(_id: String!): JSON
`

