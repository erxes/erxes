import { gql } from '@apollo/client';

const GET_CHANNELS = gql`
  query Channels($page: Int, $perPage: Int, $memberIds: [String]) {
    channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
      _id
      conversationCount
      description
      integrationIds
      memberIds
      name
      openConversationCount
    }
    channelsTotalCount
  }
`;

const GET_CHANNEL_DETAIL_BY_ID = gql`
  query ChannelDetail($id: String!) {
    getChannel(_id: $id) {
      _id
      conversationCount
      description
      integrationIds
      memberIds
      name
      openConversationCount
    }
  }
`;

export { GET_CHANNELS, GET_CHANNEL_DETAIL_BY_ID };
