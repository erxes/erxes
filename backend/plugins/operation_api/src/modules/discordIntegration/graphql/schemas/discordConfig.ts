import {
  DISCORD_MENTION_TARGETS,
  DISCORD_NOTIFICATION_EVENTS,
} from '@/discordIntegration/constants';

export const type = `
  enum OperationDiscordNotificationEvent {
    ${DISCORD_NOTIFICATION_EVENTS.join('\n    ')}
  }

  enum OperationDiscordMention {
    ${DISCORD_MENTION_TARGETS.join('\n    ')}
  }

  type OperationDiscordConfig {
    _id: String!
    teamId: String!
    connectionId: String!
    channelId: String!
    channelName: String!
    events: [OperationDiscordNotificationEvent!]!
    mention: OperationDiscordMention!
    mentionEvents: [OperationDiscordNotificationEvent!]!
    isActive: Boolean!
    lastError: String
    lastSentAt: Date
    createdAt: Date!
    updatedAt: Date!
  }
`;

const saveTeamConfigParams = `
  _id: String
  teamId: String!
  connectionId: String!
  channelId: String!
  events: [OperationDiscordNotificationEvent!]!
  mention: OperationDiscordMention
  mentionEvents: [OperationDiscordNotificationEvent!]
  isActive: Boolean
`;

export const queries = `
  operationDiscordConfigsByTeam(teamId: String!): [OperationDiscordConfig!]!
  operationDiscordConfigs(connectionId: String): [OperationDiscordConfig!]!
`;

export const mutations = `
  operationDiscordSaveTeamConfig(${saveTeamConfigParams}): OperationDiscordConfig
  operationDiscordRemoveTeamConfig(_id: String!): DisconnectResponse
  operationDiscordSendTestMessage(_id: String!): OperationDiscordConfig
`;
