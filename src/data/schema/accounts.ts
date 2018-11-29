export const types = `
  type Account {
    _id: String
    kind: String
    name: String
    id: String
  }

  input TwitterIntegrationAuthParams {
    oauth_token: String!
    oauth_verifier: String!
  }
`;

export const queries = `
  accounts(kind: String): [Account]
`;

export const mutations = `
  accountsRemove(_id: String!): JSON
  accountsAddTwitter(queryParams: TwitterIntegrationAuthParams): Account
`;
