import { gql } from '@apollo/client';

const EDIT_CHANNELS = gql`
  mutation ChannelsEdit(
    $id: String!
    $name: String!
    $description: String
    $memberIds: [String]
    $integrationIds: [String]
  ) {
    channelsEdit(
      _id: $id
      name: $name
      description: $description
      memberIds: $memberIds
      integrationIds: $integrationIds
    ) {
      _id
      conversationCount
      description
      integrationIds
      memberIds
      name
      openConversationCount
      userId
    }
  }
`;

export { EDIT_CHANNELS };
