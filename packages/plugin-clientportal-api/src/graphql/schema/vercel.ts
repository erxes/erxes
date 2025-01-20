export const queries = `
    clientPortalGetVercelDomains(_id: String!): JSON
`

export const mutations = `
    clientPortalDeployVercel(_id: String!): JSON
    clientPortalRemoveVercel(_id: String!): Boolean
    clientPortalAddDomainToVercel(_id: String!, domain: String): JSON
`