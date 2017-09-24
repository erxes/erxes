export const types = `
  type Integration {
    _id: String!
    kind: String
    name: String
    code: String
    brandId: String
    formId: String
    formData: JSON
    messengerData: JSON
    twitterData: JSON
    facebookData: JSON
    uiOptions: JSON

    brand: Brand
    form: Form
    channels: [Channel]
  }
`;

export const queries = `
  integrations(limit: Int, kind: String): [Integration]
  integrationDetail(_id: String!): Integration
  totalIntegrationsCount(kind: String): Int
`;
