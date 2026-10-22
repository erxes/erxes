import { MESSAGE_FIELDS } from './fields';
import { gql } from '@apollo/client';

const WIDGETS_INSERT_MESSAGE_MUTATION = gql`
mutation WidgetsInsertMessage(
  $integrationId: String!
  $conversationId: String
  $contentType: String
  $message: String
  $attachments: [AttachmentInput]
  $payload: String
) {
  widgetsInsertMessage(
    integrationId: $integrationId
    conversationId: $conversationId
    contentType: $contentType
    message: $message
    attachments: $attachments
    payload: $payload
  ) {
    ${MESSAGE_FIELDS}
  }
}
`;

const READ_CONVERSATION_MESSAGES_MUTATION = gql`
  mutation widgetsReadConversationMessages($conversationId: String) {
    widgetsReadConversationMessages(conversationId: $conversationId)
  }
`;

const SAVE_BROWSER_INFO = gql`
mutation widgetsSaveBrowserInfo($browserInfo: JSON!) {
  widgetsSaveBrowserInfo(browserInfo: $browserInfo) {
    ${MESSAGE_FIELDS}
  }
}
`;

const connect = (isCloudFlareEnabled?: boolean) => gql`
  mutation connect(
    $integrationId: String!,
    $email: String,
    $isUser: Boolean,
    $phone: String,
    $code: String
    $data: JSON,
    $companyData: JSON,
    ) {
    widgetsMessengerConnect(
      integrationId: $integrationId,
      email: $email,
      isUser: $isUser,
      phone: $phone,
      code: $code,
      data: $data,
      companyData: $companyData,
    ) {
      integrationId,
      messengerData,
      ${
        isCloudFlareEnabled
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
      languageCode,
      uiOptions,
      customerId,
      visitorId,
      sessionToken,
      ticketConfigs
      customer {
        _id
        firstName
        lastName
        phones
        emails
      }
    }
  }
`;

const EDIT_CUSTOMER = gql`
  mutation CustomersEdit(
    $firstName: String
    $lastName: String
    $emails: [String]
    $phones: [String]
  ) {
    widgetsTicketCustomersEdit(
      firstName: $firstName
      lastName: $lastName
      emails: $emails
      phones: $phones
    ) {
      _id
      email
      emails
      firstName
      lastName
      phone
      phones
      primaryEmail
      primaryPhone
    }
  }
`;

const WIDGET_CHANGE_OPERATOR_STATUS_MUTATION = gql`
  mutation WidgetChangeOperatorStatus(
    $conversationId: String!
    $operatorStatus: String!
  ) {
    widgetChangeOperatorStatus(
      conversationId: $conversationId
      operatorStatus: $operatorStatus
    )
  }
`;

export {
  WIDGETS_INSERT_MESSAGE_MUTATION,
  READ_CONVERSATION_MESSAGES_MUTATION,
  SAVE_BROWSER_INFO,
  connect,
  EDIT_CUSTOMER,
  WIDGET_CHANGE_OPERATOR_STATUS_MUTATION,
};
