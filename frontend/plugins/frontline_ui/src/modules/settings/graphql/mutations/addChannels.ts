import { gql } from '@apollo/client';

const ADD_CHANNELS = gql`
  mutation ChannelsAdd(
    $name: String!
    $description: String
    $memberIds: [String]
  ) {
    channelsAdd(name: $name, description: $description, memberIds: $memberIds) {
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

export { ADD_CHANNELS };
