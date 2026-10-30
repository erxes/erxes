export const type = `
  type OperationDiscordCustomerChannel {
    _id: String!
    connectionId: String!
    guildId: String!
    channelId: String!
    channelName: String!
    companyId: String!
    teamId: String!
    createdAt: Date!
    updatedAt: Date!
  }
`;

const saveCustomerChannelParams = `
  _id: String
  connectionId: String!
  channelId: String!
  companyId: String!
  teamId: String!
`;

export const queries = `
  operationDiscordCustomerChannels(connectionId: String): [OperationDiscordCustomerChannel!]!
`;

export const mutations = `
  operationDiscordSaveCustomerChannel(${saveCustomerChannelParams}): OperationDiscordCustomerChannel
  operationDiscordRemoveCustomerChannel(_id: String!): DisconnectResponse
  operationDiscordEnableCommands(_id: String!): OperationDiscordConnection
  operationDiscordDisableCommands(_id: String!): OperationDiscordConnection
`;
