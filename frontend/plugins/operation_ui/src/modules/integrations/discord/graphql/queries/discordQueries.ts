import { gql } from '~/gql';

export const GET_DISCORD_CONNECTIONS = gql(`
  query operationDiscordConnections {
    operationDiscordConnections {
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
    operationDiscordConfigs {
      _id
      teamId
      connectionId
      channelId
    }
  }
`);

export const CHECK_DISCORD_TOKEN = gql(`
  query operationDiscordCheckToken($token: String!) {
    operationDiscordCheckToken(token: $token) {
      applicationId
      botUserId
      botUsername
      inviteUrl
      guilds {
        id
        name
        iconUrl
        isConnected
      }
    }
  }
`);

export const GET_DISCORD_CHANNELS = gql(`
  query operationDiscordChannels($connectionId: String!) {
    operationDiscordChannels(connectionId: $connectionId) {
      id
      name
      type
    }
  }
`);

export const GET_DISCORD_CONFIG_BY_TEAM = gql(`
  query operationDiscordConfigByTeam($teamId: String!) {
    operationDiscordConfigByTeam(teamId: $teamId) {
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

export const GET_DISCORD_OAUTH_REDIRECT_URI = gql(`
  query operationDiscordOAuthRedirectUri {
    operationDiscordOAuthRedirectUri
  }
`);

export const GET_DISCORD_MY_ACCOUNT = gql(`
  query operationDiscordMyAccount {
    operationDiscordMyAccount {
      linkingEnabled
      link {
        _id
        userId
        discordUserId
        username
        globalName
        avatarUrl
        linkedAt
      }
    }
  }
`);

export const GET_DISCORD_TEAM_MEMBERS = gql(`
  query operationDiscordTeamMembers($teamId: String!) {
    operationDiscordTeamMembers(teamId: $teamId) {
      userId
      inServer
      link {
        _id
        userId
        discordUserId
        username
        globalName
        avatarUrl
        linkedAt
      }
    }
  }
`);

export const GET_DISCORD_CUSTOMER_CHANNELS = gql(`
  query operationDiscordCustomerChannels {
    operationDiscordCustomerChannels {
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
