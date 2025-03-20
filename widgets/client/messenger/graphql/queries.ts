import { MESSAGE_FIELDS, USER_DETAIL_FIELD } from "./fields";

import gql from "graphql-tag";

const GET_UNREAD_COUNT = gql`
  query widgetsUnreadCount($conversationId: String) {
    widgetsUnreadCount(conversationId: $conversationId)
  }
`;

const GET_CONVERSATION_DETAIL = (isDailycoEnabled: boolean) => gql`
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${MESSAGE_FIELDS}
        ${
          isDailycoEnabled
            ? `
        videoCallData {
          url
          status
        }`
            : ""
        }
      }

      operatorStatus
      isOnline
      supporters {
        _id
        details {
          ${USER_DETAIL_FIELD}
        }
      }
      participatedUsers {
        _id
        details {
          ${USER_DETAIL_FIELD}
          shortName
          description
          position
          location
        }
        links
      }
    }
  }
`;

const GET_WIDGET_EXPORT_MESSENGER_DATA = gql`
  query widgetExportMessengerData($_id: String, $integrationId: String!) {
    widgetExportMessengerData(_id: $_id, integrationId: $integrationId)
  }
`;

const GET_FAQ_TOPIC = gql`
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      parentCategories {
        _id
        title
      }
    }
  }
`;

const GET_CLOUDFLARE_CALL_INTEGRATION = gql`
  query CloudflareCallsGetIntegrations {
    cloudflareCallsGetIntegrations {
      _id
      erxesApiId
      name
    }
  }
`

const TICKET_CHECK_PROGRESS = gql`
  query TicketCheckProgress($number: String!) {
    ticketCheckProgress(number: $number) {
      _id
      name
      number
      status
      stage {
        name
        _id
      }
      attachments {
        url
        name
      }
      description
      type
    }
  }
`

const TICKET_CHECK_PROGRESS_FORGET = gql`
  query ticketCheckProgressForget($email: String, $phoneNumber: String) {
    ticketCheckProgressForget(email: $email, phoneNumber: $phoneNumber)
  }
`

const TICKET_COMMENTS = gql`
query clientPortalComments($typeId: String!, $type: String!) {
  clientPortalComments(typeId: $typeId, type: $type) {
    _id
    content
    createdUser {
      _id
      email
      firstName
    }
    type
    createdAt
  }
}
`;

const TICKET_ACTIVITY_LOGS = gql`
  query activityLogs($contentType: String!, $contentId: String) {
    activityLogs(contentType: $contentType, contentId: $contentId) {
      _id
      action
      contentType
      createdByDetail
      content
      createdAt
    }
  }
`;

export {
  GET_UNREAD_COUNT,
  GET_CONVERSATION_DETAIL,
  GET_WIDGET_EXPORT_MESSENGER_DATA,
  GET_FAQ_TOPIC,
  GET_CLOUDFLARE_CALL_INTEGRATION,
  TICKET_CHECK_PROGRESS,
  TICKET_CHECK_PROGRESS_FORGET,
  TICKET_COMMENTS,
  TICKET_ACTIVITY_LOGS
};
