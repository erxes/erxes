import { MESSAGE_FIELDS } from './fields';
import gql from 'graphql-tag';

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
  mutation TicketsAdd(
    $name: String!
    $description: String
    $attachments: [AttachmentInput]
    $stageId: String
    $customerIds: [String]
    $type: String
  ) {
    ticketsAdd(
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

const CUSTOMER_ADD = gql`
  mutation customersAdd(
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
  ) {
    customersAdd(
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
    ) {
      _id
      email
      createdAt
    }
  }
`;

const TICKET_COMMENTS_ADD = gql`
  mutation clientPortalCommentsAdd(
    $type: String!
    $typeId: String!
    $content: String!
    $userType: String!
  ) {
    clientPortalCommentsAdd(
      type: $type
      typeId: $typeId
      content: $content
      userType: $userType
    ) {
      _id
      type
      createdAt
    }
  }
`;

const TICKET_CHECK_PROGRESS = gql`
  mutation TicketCheckProgress($number: String!) {
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
`;

const TICKET_CHECK_PROGRESS_FORGET = gql`
  mutation ticketCheckProgressForget($email: String, $phoneNumber: String) {
    ticketCheckProgressForget(email: $email, phoneNumber: $phoneNumber)
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
  CUSTOMER_ADD,
  TICKET_COMMENTS_ADD,
  TICKET_CHECK_PROGRESS,
  TICKET_CHECK_PROGRESS_FORGET,
};
