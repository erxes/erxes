import { gql } from '~/gql';

export const CHANNEL_DETAIL_QUERY = gql(`
  query ChannelInline($id: String!) {
    getChannel(_id: $id) {
      _id
      name
      icon
    }
  }
`);
