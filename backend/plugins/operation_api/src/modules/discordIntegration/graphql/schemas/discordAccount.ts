export const type = `
  type OperationDiscordUserLink {
    _id: String!
    userId: String!
    discordUserId: String!
    username: String!
    globalName: String
    avatarUrl: String
    linkedAt: Date
  }

  type OperationDiscordAccount {
    linkingEnabled: Boolean!
    link: OperationDiscordUserLink
  }

  type OperationDiscordTeamMember {
    userId: String!
    link: OperationDiscordUserLink
    inServer: Boolean
  }
`;

export const queries = `
  operationDiscordMyAccount: OperationDiscordAccount!
  operationDiscordOAuthRedirectUri: String!
  operationDiscordTeamMembers(teamId: String!): [OperationDiscordTeamMember!]!
`;

export const mutations = `
  operationDiscordStartAccountLink: String!
  operationDiscordUnlinkMyAccount: DisconnectResponse
  operationDiscordUnlinkMember(userId: String!): DisconnectResponse
  operationDiscordRemindMember(teamId: String!, userId: String!): DisconnectResponse
`;
