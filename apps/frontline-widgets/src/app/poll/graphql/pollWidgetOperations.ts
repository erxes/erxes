import { gql } from '@apollo/client';

export const WIDGETS_POLL_CONNECT = gql`
  mutation widgetsPollConnect(
    $channelId: String!
    $pollCode: String!
    $cachedCustomerId: String
  ) {
    widgetsPollConnect(
      channelId: $channelId
      pollCode: $pollCode
      cachedCustomerId: $cachedCustomerId
    ) {
      poll {
        _id
        code
        title
        question
        allowMultiselect
        options {
          _id
          text
          order
        }
      }
      votedOptionIds
    }
  }
`;

export const WIDGETS_POLL_SUBMIT = gql`
  mutation widgetsPollSubmit(
    $pollCode: String!
    $optionIds: [String!]!
    $cachedCustomerId: String
  ) {
    widgetsPollSubmit(
      pollCode: $pollCode
      optionIds: $optionIds
      cachedCustomerId: $cachedCustomerId
    ) {
      status
      customerId
      conversationId
    }
  }
`;
