import { gql } from '@apollo/client';

const REMOVE_CHANNELS = gql`
  mutation ChannelsRemove($id: String!) {
    channelsRemove(_id: $id)
  }
`;

export { REMOVE_CHANNELS };
