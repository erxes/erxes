import { gql } from '~/gql';

export const CONNECT_DISCORD = gql(`
  mutation operationDiscordConnect($token: String!, $guildId: String!) {
    operationDiscordConnect(token: $token, guildId: $guildId) {
      _id
      guildId
      guildName
      guildIconUrl
      applicationId
      botUsername
      hasClientSecret
      health {
        status
        lastVerifiedAt
        lastError
      }
      createdAt
    }
  }
`);

export const DISCONNECT_DISCORD = gql(`
  mutation operationDiscordDisconnect($_id: String!) {
    operationDiscordDisconnect(_id: $_id) {
      success
    }
  }
`);

export const SAVE_DISCORD_TEAM_CONFIG = gql(`
  mutation operationDiscordSaveTeamConfig(
    $teamId: String!
    $connectionId: String!
    $channelId: String!
    $events: [OperationDiscordNotificationEvent!]!
    $isActive: Boolean
  ) {
    operationDiscordSaveTeamConfig(
      teamId: $teamId
      connectionId: $connectionId
      channelId: $channelId
      events: $events
      isActive: $isActive
    ) {
      _id
      teamId
      connectionId
      channelId
      channelName
      events
      isActive
      lastError
      lastSentAt
    }
  }
`);

export const DISCONNECT_DISCORD_TEAM = gql(`
  mutation operationDiscordDisconnectTeam($teamId: String!) {
    operationDiscordDisconnectTeam(teamId: $teamId) {
      success
    }
  }
`);

export const SEND_DISCORD_TEST_MESSAGE = gql(`
  mutation operationDiscordSendTestMessage($teamId: String!) {
    operationDiscordSendTestMessage(teamId: $teamId) {
      _id
      lastError
      lastSentAt
    }
  }
`);

export const SET_DISCORD_CLIENT_SECRET = gql(`
  mutation operationDiscordSetClientSecret($_id: String!, $clientSecret: String!) {
    operationDiscordSetClientSecret(_id: $_id, clientSecret: $clientSecret) {
      _id
      hasClientSecret
    }
  }
`);

export const CLEAR_DISCORD_CLIENT_SECRET = gql(`
  mutation operationDiscordClearClientSecret($_id: String!) {
    operationDiscordClearClientSecret(_id: $_id) {
      _id
      hasClientSecret
    }
  }
`);

export const START_DISCORD_ACCOUNT_LINK = gql(`
  mutation operationDiscordStartAccountLink {
    operationDiscordStartAccountLink
  }
`);

export const UNLINK_MY_DISCORD_ACCOUNT = gql(`
  mutation operationDiscordUnlinkMyAccount {
    operationDiscordUnlinkMyAccount {
      success
    }
  }
`);

export const UNLINK_DISCORD_MEMBER = gql(`
  mutation operationDiscordUnlinkMember($userId: String!) {
    operationDiscordUnlinkMember(userId: $userId) {
      success
    }
  }
`);

export const REMIND_DISCORD_MEMBER = gql(`
  mutation operationDiscordRemindMember($teamId: String!, $userId: String!) {
    operationDiscordRemindMember(teamId: $teamId, userId: $userId) {
      success
    }
  }
`);
