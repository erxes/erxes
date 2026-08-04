import { gql } from '@apollo/client';

const GET_WIDGET_NOTIFICATIONS = gql`
  query WidgetsNotifications(
    $integrationId: String!
    $customerId: String
    $visitorId: String
  ) {
    widgetsConversations(
      integrationId: $integrationId
      customerId: $customerId
      visitorId: $visitorId
    ) {
      _id
      createdAt
      messages {
        _id
        content
        createdAt
        customerId
        userId
        isCustomerRead
        fromBot
        user {
          _id
          details {
            avatar
            fullName
            shortName
          }
        }
      }
      participatedUsers {
        _id
        details {
          avatar
          fullName
          shortName
        }
      }
    }
  }
`;

const MARK_NOTIFICATIONS_READ = gql`
  mutation WidgetsReadConversationMessages($conversationId: String) {
    widgetsReadConversationMessages(conversationId: $conversationId)
  }
`;

const NOTIFICATION_CONVERSATION_CHANGED = gql`
  subscription NotificationConversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
      content
      createdAt
      customerId
      userId
      isCustomerRead
      fromBot
      user {
        _id
        details {
          avatar
          fullName
          shortName
        }
      }
    }
  }
`;

export {
  GET_WIDGET_NOTIFICATIONS,
  MARK_NOTIFICATIONS_READ,
  NOTIFICATION_CONVERSATION_CHANGED,
};
