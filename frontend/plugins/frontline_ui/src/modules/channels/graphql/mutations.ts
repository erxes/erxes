import { gql } from '@apollo/client';

const ADD_CHANNEL = gql`
  mutation ChannelAdd(
    $name: String!
    $icon: String
    $description: String
    $memberIds: [String]
  ) {
    channelAdd(
      name: $name
      icon: $icon
      description: $description
      memberIds: $memberIds
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

const UPDATE_CHANNEL = gql`
  mutation ChannelUpdate(
    $id: String!
    $name: String
    $description: String
    $icon: String
    $memberIds: [String]
  ) {
    channelUpdate(
      _id: $id
      name: $name
      description: $description
      icon: $icon
      memberIds: $memberIds
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

const REMOVE_CHANNEL = gql`
  mutation ChannelRemove($id: String!) {
    channelRemove(_id: $id) {
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

const ADD_CHANNEL_MEMBERS = gql`
  mutation ChannelAddMembers($id: String!, $memberIds: [String]) {
    channelAddMembers(_id: $id, memberIds: $memberIds) {
      _id
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
      channelId
      role
    }
  }
`;

const REMOVE_CHANNEL_MEMBER = gql`
  mutation ChannelRemoveMember($channelId: String!, $memberId: String!) {
    channelRemoveMember(channelId: $channelId, memberId: $memberId) {
      _id
      memberId
      role
      channelId
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
    }
  }
`;

const UPDATE_CHANNEL_MEMBER = gql`
  mutation ChannelUpdateMember($id: String!, $role: String) {
    channelUpdateMember(_id: $id, role: $role) {
      _id
      channelId
      memberId
      role
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
    }
  }
`;

export {
  ADD_CHANNEL,
  UPDATE_CHANNEL,
  REMOVE_CHANNEL,
  ADD_CHANNEL_MEMBERS,
  REMOVE_CHANNEL_MEMBER,
  UPDATE_CHANNEL_MEMBER,
};
