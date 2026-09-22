import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';
import { STRUCTURED_MESSAGE_FIELDS } from '@/inbox/conversations/graphql/subscriptions/messageFields';

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
      ${STRUCTURED_MESSAGE_FIELDS}
      conversationId
      content
      formWidgetData
      extraData
      ${ATTACHMENT_GQL}
      internal
      fromBot
      createdAt
      isCustomerRead
      userId
      customerId
      fromBot
      botData
    }
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
`;
