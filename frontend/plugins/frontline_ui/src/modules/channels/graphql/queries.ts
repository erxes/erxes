import { gql } from '~/gql';

const GET_CHANNELS = gql(`
  query frontlineChannelList(
    $name: String
    $userId: String
    $channelIds: [String]
    $integrationId: String
  ) {
    getChannels(
      name: $name
      userId: $userId
      channelIds: $channelIds
      integrationId: $integrationId
    ) {
      _id
      icon
      name
      description
      scope
      createdAt
      updatedAt
      memberCount
      pipelineCount
      hasTickets
      responseTemplateCount
      formCount
      integrationCount
      integrationKinds
    }
  }
`);

const GET_CHANNEL = gql(`
  query GetChannel($id: String!) {
    getChannel(_id: $id) {
      _id
      icon
      name
      pipelineCount
      description
      createdAt
      updatedAt
      memberCount
    }
  }
`);

const GET_CHANNEL_MEMBERS = gql(`
  query GetChannelMembers($channelId: String, $channelIds: [String]) {
    getChannelMembers(channelId: $channelId, channelIds: $channelIds) {
      _id
      channelId
      memberId
      member {
        _id
        email
        username
        isActive
        isOnboarded
        details {
          firstName
          lastName
          fullName
          avatar
        }
      }
      role
    }
  }
`);

const GET_MY_CHANNELS = gql(`
  query GetMyChannels($name: String, $sortField: String, $sortDirection: Int) {
    getMyChannels(
      name: $name
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      icon
      name
      description
      scope
      createdAt
      updatedAt
      memberCount
      pipelineCount
      unreadConversationCount
    }
  }
`);

// Reading this provisions the caller's personal channel on the API side if they
// do not have one yet, so it is safe to call from the settings page directly.
const GET_PERSONAL_CHANNEL = gql(`
  query GetPersonalChannel {
    getPersonalChannel {
      _id
      icon
      name
      description
      scope
      createdAt
      updatedAt
      memberCount
      integrationCount
    }
  }
`);

// Page names come from each page's own token; the Instagram page lookup spends
// the shared app quota on a user token, so it is left out of this peek.
const GET_CHANNEL_INTEGRATIONS_PEEK = gql(`
  query ChannelIntegrationsPeek($channelId: String!) {
    integrations(channelId: $channelId, limit: 50) {
      list {
        _id
        name
        kind
        isActive
        brandId
        channelId
        healthStatus {
          status
          error
        }
        facebookPage {
          pageId
          name
        }
      }
      totalCount
    }
  }
`);

export {
  GET_CHANNELS,
  GET_CHANNEL,
  GET_CHANNEL_MEMBERS,
  GET_MY_CHANNELS,
  GET_PERSONAL_CHANNEL,
  GET_CHANNEL_INTEGRATIONS_PEEK,
};
