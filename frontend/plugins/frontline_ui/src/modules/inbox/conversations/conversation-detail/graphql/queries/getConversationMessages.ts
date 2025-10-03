import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';

export const GET_CONVERSATION_MESSAGES = gql`
  query ConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    conversationMessages(
      conversationId: $conversationId
      skip: $skip
      limit: $limit
      getFirst: $getFirst
    ) {
      _id
      content
      formWidgetData
      ${ATTACHMENT_GQL}
      internal
      createdAt
      isCustomerRead
      userId
      customerId
    }
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
`;
