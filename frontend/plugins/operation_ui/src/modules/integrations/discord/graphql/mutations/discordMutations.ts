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
    $_id: String
    $teamId: String!
    $connectionId: String!
    $channelId: String!
    $events: [OperationDiscordNotificationEvent!]!
    $mention: OperationDiscordMention
    $mentionEvents: [OperationDiscordNotificationEvent!]
    $isActive: Boolean
  ) {
    operationDiscordSaveTeamConfig(
      _id: $_id
      teamId: $teamId
      connectionId: $connectionId
      channelId: $channelId
      events: $events
      mention: $mention
      mentionEvents: $mentionEvents
      isActive: $isActive
    ) {
      _id
      teamId
      connectionId
      channelId
      channelName
      events
      mention
      mentionEvents
      isActive
      lastError
      lastSentAt
    }
  }
`);

export const REMOVE_DISCORD_TEAM_CONFIG = gql(`
  mutation operationDiscordRemoveTeamConfig($_id: String!) {
    operationDiscordRemoveTeamConfig(_id: $_id) {
      success
    }
  }
`);

export const SEND_DISCORD_TEST_MESSAGE = gql(`
  mutation operationDiscordSendTestMessage($_id: String!) {
    operationDiscordSendTestMessage(_id: $_id) {
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
      memberLinkingPaused
    }
  }
`);

export const SET_DISCORD_MEMBER_LINKING = gql(`
  mutation operationDiscordSetMemberLinking($_id: String!, $enabled: Boolean!) {
    operationDiscordSetMemberLinking(_id: $_id, enabled: $enabled) {
      _id
      hasClientSecret
      memberLinkingPaused
    }
  }
`);

export const START_DISCORD_ACCOUNT_LINK = gql(`
  mutation operationDiscordStartAccountLink {
    operationDiscordStartAccountLink
  }
`);

export const CONFIRM_DISCORD_ACCOUNT_LINK = gql(`
  mutation operationDiscordConfirmAccountLink($token: String!) {
    operationDiscordConfirmAccountLink(token: $token) {
      _id
      username
      globalName
    }
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

export const LINK_DISCORD_CUSTOMER_CHANNELS = gql(`
  mutation operationDiscordLinkCustomerChannels(
    $connectionId: String!
    $channelIds: [String!]!
    $companyId: String!
    $teamId: String!
  ) {
    operationDiscordLinkCustomerChannels(
      connectionId: $connectionId
      channelIds: $channelIds
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

export const SAVE_DISCORD_CUSTOMER_CHANNEL = gql(`
  mutation operationDiscordSaveCustomerChannel(
    $_id: String!
    $connectionId: String!
    $channelIds: [String!]!
    $companyId: String!
    $teamId: String!
  ) {
    operationDiscordSaveCustomerChannel(
      _id: $_id
      connectionId: $connectionId
      channelIds: $channelIds
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
