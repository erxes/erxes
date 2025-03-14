import { MESSAGE_FIELDS } from "./fields";
import gql from "graphql-tag";

const WIDGETS_INSERT_MESSAGE_MUTATION = ({
  queryVariables,
  queryParams
}: {
  queryVariables: string;
  queryParams: string;
}) => gql`
                mutation widgetsInsertMessage(
                  ${queryVariables}
                  $message: String
                  $contentType: String
                  $conversationId: String
                  $attachments: [AttachmentInput]
                  $skillId: String
                  $payload: String
                ) {
    
                widgetsInsertMessage(
                  ${queryParams}
                  contentType: $contentType
                  message: $message
                  conversationId: $conversationId
                  attachments: $attachments
                  skillId: $skillId
                  payload: $payload

                ) {
                  ${MESSAGE_FIELDS}
                }
              }`;
const WIDGET_BOT_REQUEST_MUTATION = gql`
  mutation widgetBotRequest(
    $message: String!
    $payload: String
    $type: String!
    $conversationId: String
    $customerId: String
    $visitorId: String
    $integrationId: String!
  ) {
    widgetBotRequest(
      message: $message
      payload: $payload
      type: $type
      conversationId: $conversationId
      customerId: $customerId
      visitorId: $visitorId
      integrationId: $integrationId
    )
  }
`;
const READ_CONVERSATION_MESSAGES_MUTATION = gql`
  mutation widgetsReadConversationMessages($conversationId: String) {
    widgetsReadConversationMessages(conversationId: $conversationId)
  }
`;

const SEND_TYPING_INFO_MUTATION = gql`
  mutation widgetsSendTypingInfo($conversationId: String!, $text: String) {
    widgetsSendTypingInfo(conversationId: $conversationId, text: $text)
  }
`;
const CHANGE_CONVERSATION_OPERATOR = gql`
  mutation changeConversationOperator($_id: String!, $operatorStatus: String!) {
    changeConversationOperator(_id: $_id, operatorStatus: $operatorStatus)
  }
`;
const WIDGETS_SAVE_CUSTOMER_GET_NOTIFIED = gql`
  mutation widgetsSaveCustomerGetNotified(
    $customerId: String
    $visitorId: String
    $type: String!
    $value: String!
  ) {
    widgetsSaveCustomerGetNotified(
      customerId: $customerId
      visitorId: $visitorId
      type: $type
      value: $value
    )
  }
`;

const WIDGET_GET_BOT_INTIAL_MESSAGE = gql`
  mutation widgetGetBotInitialMessage($integrationId: String) {
    widgetGetBotInitialMessage(integrationId: $integrationId)
  }
`;
const SAVE_BROWSER_INFO = gql`
mutation widgetsSaveBrowserInfo($customerId: String $visitorId: String $browserInfo: JSON!) {
  widgetsSaveBrowserInfo(customerId: $customerId visitorId: $visitorId browserInfo: $browserInfo) {
    ${MESSAGE_FIELDS}
  }
}
`;

const CLOUDFLARE_CALL = gql`
  mutation cloudflareMakeCall(
    $callerNumber: String!
    $callerEmail: String
    $roomState: String!
    $audioTrack: String!
    $integrationId: String!
    $departmentId: String!
  ) {
    cloudflareMakeCall(
      callerNumber: $callerNumber
      callerEmail: $callerEmail
      roomState: $roomState
      audioTrack: $audioTrack
      integrationId: $integrationId
      departmentId: $departmentId
    )
  }
`
const CLOUDFLARE_LEAVE_CALL = gql`
  mutation CloudflareLeaveCall(
    $roomState: String!
    $originator: String
    $duration: Int
    $audioTrack: String!
  ) {
    cloudflareLeaveCall(
      roomState: $roomState
      originator: $originator
      duration: $duration
      audioTrack: $audioTrack
    ) 
  }
`

export {
  WIDGETS_INSERT_MESSAGE_MUTATION,
  WIDGET_GET_BOT_INTIAL_MESSAGE,
  READ_CONVERSATION_MESSAGES_MUTATION,
  WIDGET_BOT_REQUEST_MUTATION,
  SEND_TYPING_INFO_MUTATION,
  CHANGE_CONVERSATION_OPERATOR,
  WIDGETS_SAVE_CUSTOMER_GET_NOTIFIED,
  SAVE_BROWSER_INFO,
  CLOUDFLARE_CALL,
  CLOUDFLARE_LEAVE_CALL
};
