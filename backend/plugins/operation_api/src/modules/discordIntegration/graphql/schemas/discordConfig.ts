import { DISCORD_NOTIFICATION_EVENTS } from '@/discordIntegration/constants';

export const type = `
  enum OperationDiscordNotificationEvent {
    ${DISCORD_NOTIFICATION_EVENTS.join('\n    ')}
  }

  type OperationDiscordConfig {
    _id: String!
    teamId: String!
    connectionId: String!
    channelId: String!
    channelName: String!
    events: [OperationDiscordNotificationEvent!]!
    isActive: Boolean!
    lastError: String
    lastSentAt: Date
    createdAt: Date!
    updatedAt: Date!
  }
`;

const saveTeamConfigParams = `
  teamId: String!
  connectionId: String!
  channelId: String!
  events: [OperationDiscordNotificationEvent!]!
  isActive: Boolean
`;

export const queries = `
  operationDiscordConfigByTeam(teamId: String!): OperationDiscordConfig
  operationDiscordConfigs(connectionId: String): [OperationDiscordConfig!]!
`;

export const mutations = `
  operationDiscordSaveTeamConfig(${saveTeamConfigParams}): OperationDiscordConfig
  operationDiscordDisconnectTeam(teamId: String!): DisconnectResponse
  operationDiscordSendTestMessage(teamId: String!): OperationDiscordConfig
`;
