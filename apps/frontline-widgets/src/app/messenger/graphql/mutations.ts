import { MESSAGE_FIELDS } from './fields';
import { gql } from '@apollo/client';

const WIDGETS_INSERT_MESSAGE_MUTATION = gql`
mutation WidgetsInsertMessage(
  $integrationId: String!
  $customerId: String
  $visitorId: String
  $conversationId: String
  $contentType: String
  $message: String
  $attachments: [AttachmentInput]
) {
  widgetsInsertMessage(
    integrationId: $integrationId
    customerId: $customerId
    visitorId: $visitorId
    conversationId: $conversationId
    contentType: $contentType
    message: $message
    attachments: $attachments
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
mutation widgetsSaveBrowserInfo($customerId: String $visitorId: String $browserInfo: JSON!) {
  widgetsSaveBrowserInfo(customerId: $customerId visitorId: $visitorId browserInfo: $browserInfo) {
    ${MESSAGE_FIELDS}
  }
}
`;

const connect = (isCloudFlareEnabled?: boolean) => gql`
  mutation connect(
    $integrationId: String!,
    $visitorId: String
    $cachedCustomerId: String,
    $email: String,
    $isUser: Boolean,
    $phone: String,
    $code: String
    $data: JSON,
    $companyData: JSON,
    ) {
    widgetsMessengerConnect(
      integrationId: $integrationId,
      visitorId: $visitorId,
      cachedCustomerId: $cachedCustomerId,
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
      ticketConfig
    }
  }
`;

const EDIT_CUSTOMER = gql`
  mutation CustomersEdit(
    $customerId: String!
    $firstName: String
    $lastName: String
    $emails: [String]
    $phones: [String]
  ) {
    widgetsTicketCustomersEdit(
      customerId: $customerId
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

export {
  WIDGETS_INSERT_MESSAGE_MUTATION,
  READ_CONVERSATION_MESSAGES_MUTATION,
  SAVE_BROWSER_INFO,
  connect,
  EDIT_CUSTOMER,
};
