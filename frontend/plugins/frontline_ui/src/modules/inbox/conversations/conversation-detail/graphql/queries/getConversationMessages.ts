import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';

export const GET_CONVERSATION_MESSAGES = gql`
  query FrontlineConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
    $searchValue: String
    $pinnedOnly: Boolean
  ) {
    conversationMessages(
      conversationId: $conversationId
      skip: $skip
      limit: $limit
      getFirst: $getFirst
      searchValue: $searchValue
      pinnedOnly: $pinnedOnly
    ) {
      _id
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
      replyToMessageId
      reactions {
        emoji
        userIds
      }
      pinnedByIds
      editedAt
      deletedAt
    }
    conversationMessagesTotalCount(
      conversationId: $conversationId
      searchValue: $searchValue
      pinnedOnly: $pinnedOnly
    )
  }
`;
