export const types = `
  type WhatsappConfig {
    appId: String!
    configId: String!
    verifyToken: String!
    hasAppSecret: Boolean!
    webhookUrl: String!
  }

  type WhatsappEmbeddedSignupConfig {
    appId: String!
    configId: String!
    graphVersion: String!
    isConfigured: Boolean!
  }

  type WhatsappConnection {
    _id: String!
    erxesApiId: String
    wabaId: String!
    phoneNumberId: String!
    displayPhoneNumber: String!
    verifiedName: String
    phoneStatus: String
    needsRegistration: Boolean!
    healthStatus: String!
    error: String
  }
`;

export const queries = `
  whatsappConfig: WhatsappConfig!
  whatsappEmbeddedSignupConfig: WhatsappEmbeddedSignupConfig!
  whatsappConnection(integrationId: String!): WhatsappConnection
`;

export const mutations = `
  "Saves the Meta app settings; an empty appSecret keeps the stored secret."
  whatsappUpdateConfig(appId: String!, appSecret: String, configId: String!, verifyToken: String): WhatsappConfig!
  "Exchanges the Embedded Signup code and saves the number as a pending connection."
  whatsappEmbeddedSignupFinish(code: String!, wabaId: String!, phoneNumberId: String!, businessId: String): WhatsappConnection!
  "Deletes the user's signup connection that was never attached to an inbox."
  whatsappDiscardConnection(_id: String!): Boolean!
`;
