import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';

export const MAIL_CONVERSATION_DETAIL_QUERY = gql`
  query mailConversationDetail($conversationId: String!, $limit: Int) {
    mailConversationDetail(conversationId: $conversationId, limit: $limit) {
      messages {
        _id
        mailData
        createdAt
        __typename
      }
      hasMore
      __typename
    }
    conversationMessages(conversationId: $conversationId, skip: 0, limit: 50) {
      _id
      mid
      conversationId
      content
      formWidgetData
      extraData
      ${ATTACHMENT_GQL}
      createdAt
      internal
      fromBot
      userId
      customerId
      botData
      messageKind
      providerData
      replyTo
      reactions
      deliveryStatus
      expiresAt
    }
  }
`;

export const MAIL_MESSAGE_INSERTED_SUBSCRIPTION = gql`
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
    }
  }
`;
