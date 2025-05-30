import { MESSAGE_FIELDS } from './fields';
import gql from 'graphql-tag';

export const messageFields = `
  _id
  conversationId
  customerId
  user {
    _id
    details {
      avatar
      fullName
      description
      location
      position
      shortName
    }
  }
  content
  createdAt
  internal
  fromBot
  contentType

  engageData {
    content
    kind
    sentAs
    messageId
    brandId
  }
  botData
  messengerAppData
  attachments {
    url
    name
    size
    type
  }
`;

const WIDGETS_INSERT_MESSAGE_MUTATION = ({
  queryVariables,
  queryParams,
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
`;
const CLOUDFLARE_LEAVE_CALL = gql`
  mutation CloudflareLeaveCall(
    $originator: String
    $duration: Int
    $audioTrack: String!
  ) {
    cloudflareLeaveCall(
      originator: $originator
      duration: $duration
      audioTrack: $audioTrack
    )
  }
`;

const TICKET_ADD = gql`
  mutation widgetTicketCreated(
    $name: String!
    $description: String
    $attachments: [AttachmentInput]
    $stageId: String!
    $customerIds: [String!]!
    $type: String!
  ) {
    widgetTicketCreated(
      name: $name
      description: $description
      attachments: $attachments
      stageId: $stageId
      customerIds: $customerIds
      type: $type
    ) {
      _id
      name
      number
      description
      attachments {
        name
        url
      }
      type
    }
  }
`;

const CUSTOMER_EDIT = gql`
  mutation WidgetsTicketCustomersEdit($customerId: String, $firstName: String, $lastName: String, $emails: [String], $phones: [String]) {
    widgetsTicketCustomersEdit(customerId: $customerId, firstName: $firstName, lastName: $lastName, emails: $emails, phones: $phones) {
      _id
      firstName
      email
    }
  }
`;

const TICKET_COMMENTS_ADD = gql`
  mutation widgetsTicketCommentAdd(
    $type: String!
    $typeId: String!
    $content: String!
    $userType: String!
    $customerId: String
  ) {
    widgetsTicketCommentAdd(
      type: $type
      typeId: $typeId
      content: $content
      userType: $userType
      customerId: $customerId
    ) {
      _id
      type
      createdAt
    }
  }
`;

const TICKET_CHECK_PROGRESS = gql`
  mutation widgetsTicketCheckProgress($number: String!) {
    widgetsTicketCheckProgress(number: $number) {
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
`;

const TICKET_CHECK_PROGRESS_FORGET = gql`
  mutation widgetsTicketCheckProgressForget($email: String, $phoneNumber: String) {
    widgetsTicketCheckProgressForget(email: $email, phoneNumber: $phoneNumber)
  }
`;

const readConversationMessages = `
  mutation widgetsReadConversationMessages($conversationId: String) {
    widgetsReadConversationMessages(conversationId: $conversationId)
  }
`;

const connect = (isCloudFlareEnabled?: boolean, isTicketEnabled?: boolean) => `
  mutation connect($brandCode: String!, $email: String, $phone: String, $code: String
    $isUser: Boolean, $data: JSON,
    $companyData: JSON, $cachedCustomerId: String $visitorId: String) {

    widgetsMessengerConnect(brandCode: $brandCode, email: $email, phone: $phone, code: $code,
      isUser: $isUser, data: $data, companyData: $companyData,
      cachedCustomerId: $cachedCustomerId, visitorId: $visitorId) {
      integrationId,
      messengerData,
      ${isCloudFlareEnabled
    ? `
      callData {
        header
        description
        secondPageHeader
        secondPageDescription
        departments {
          _id
          name
          operators
        }
        isReceiveWebCall
      },
    `
    : ''
  }
      
      ${isTicketEnabled
    ? `
        ticketData
      `
    : ``
  }
      languageCode,
      uiOptions,
      customerId,
      visitorId,
      brand {
        name
        description
      }
    }
  }
`;

const saveBrowserInfo = `
  mutation widgetsSaveBrowserInfo($customerId: String $visitorId: String $browserInfo: JSON!) {
    widgetsSaveBrowserInfo(customerId: $customerId visitorId: $visitorId browserInfo: $browserInfo) {
      ${messageFields}
    }
  }
`;

const sendTypingInfo = `
  mutation widgetsSendTypingInfo($conversationId: String!  $text: String) {
    widgetsSendTypingInfo(conversationId: $conversationId text: $text)
  }
`;

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
  CLOUDFLARE_LEAVE_CALL,
  TICKET_ADD,
  CUSTOMER_EDIT,
  TICKET_COMMENTS_ADD,
  TICKET_CHECK_PROGRESS,
  TICKET_CHECK_PROGRESS_FORGET,
  connect,
  saveBrowserInfo,
  sendTypingInfo,
  readConversationMessages,
};
