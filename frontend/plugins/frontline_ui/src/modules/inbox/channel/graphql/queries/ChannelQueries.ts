import { gql } from '@apollo/client';

export const CHANNEL_DETAIL_QUERY = gql`
  query ChannelInline($id: String!) {
    channelDetail(_id: $id) {
      _id
      name
    }
  }
`;
