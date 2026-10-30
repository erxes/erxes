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
      commandsRegisteredAt
      commandsError
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

export const ENABLE_DISCORD_COMMANDS = gql(`
  mutation operationDiscordEnableCommands($_id: String!) {
    operationDiscordEnableCommands(_id: $_id) {
      _id
      commandsRegisteredAt
      commandsError
    }
  }
`);

export const DISABLE_DISCORD_COMMANDS = gql(`
  mutation operationDiscordDisableCommands($_id: String!) {
    operationDiscordDisableCommands(_id: $_id) {
      _id
      commandsRegisteredAt
      commandsError
    }
  }
`);

export const SAVE_DISCORD_CUSTOMER_CHANNEL = gql(`
  mutation operationDiscordSaveCustomerChannel(
    $_id: String
    $connectionId: String!
    $channelId: String!
    $companyId: String!
    $teamId: String!
  ) {
    operationDiscordSaveCustomerChannel(
      _id: $_id
      connectionId: $connectionId
      channelId: $channelId
      companyId: $companyId
      teamId: $teamId
    ) {
      _id
      connectionId
      guildId
      channelId
      channelName
      companyId
      teamId
    }
  }
`);

export const REMOVE_DISCORD_CUSTOMER_CHANNEL = gql(`
  mutation operationDiscordRemoveCustomerChannel($_id: String!) {
    operationDiscordRemoveCustomerChannel(_id: $_id) {
      success
    }
  }
`);
