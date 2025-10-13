import { gql } from '@apollo/client';

const GET_CHANNELS = gql`
  query GetChannels(
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
      createdAt
      updatedAt
      memberCount
    }
  }
`;

const GET_CHANNEL = gql`
  query GetChannel($id: String!) {
    getChannel(_id: $id) {
      _id
      icon
      name
      description
      createdAt
      updatedAt
      memberCount
    }
  }
`;

const GET_CHANNEL_MEMBERS = gql`
  query GetChannelMembers($channelId: String, $channelIds: [String]) {
    getChannelMembers(channelId: $channelId, channelIds: $channelIds) {
      _id
      channelId
      memberId
      member {
        _id
        email
        username
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
`;

export { GET_CHANNELS, GET_CHANNEL, GET_CHANNEL_MEMBERS };
