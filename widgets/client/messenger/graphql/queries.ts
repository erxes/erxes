import gql from "graphql-tag";
import { MESSAGE_FIELDS, USER_DETAIL_FIELD } from "./fields";

const GET_UNREAD_COUNT = gql`query widgetsUnreadCount($conversationId: String) {
    widgetsUnreadCount(conversationId: $conversationId)
  }`

const GET_CONVERSATION_DETAIL = (isDailycoEnabled: boolean) => gql`
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        ${MESSAGE_FIELDS}
        ${isDailycoEnabled
    ? `
        videoCallData {
          url
          status
        }`
    : ''
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
    widgetExportMessengerData(_id: $_id, integrationId:$integrationId)
  }
`

const GET_FAQ_TOPIC = gql`query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      parentCategories {
        _id
        title
      }
    }
  }`

export {
  GET_UNREAD_COUNT,
  GET_CONVERSATION_DETAIL,
  GET_WIDGET_EXPORT_MESSENGER_DATA,
  GET_FAQ_TOPIC
}