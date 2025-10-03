import { gql } from '@apollo/client';

export const GET_CHANNELS_BY_MEMBERS = gql`
  query channelsByMembers($memberIds: [String]) {
    channelsByMembers(memberIds: $memberIds) {
      _id
      name
    }
  }
`;

export const GET_CHANNELS = gql`
  query Channels($page: Int, $perPage: Int, $memberIds: [String]) {
    channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
      _id
      name
    }
    channelsTotalCount
  }
`;
