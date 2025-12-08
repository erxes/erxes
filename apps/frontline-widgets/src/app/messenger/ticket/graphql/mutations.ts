import { gql } from '@apollo/client';

const SAVE_TICKET_CUSTOMERS = gql`
  mutation WidgetsTicketCustomersEdit(
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
    }
  }
`;

const CREATE_TICKET = gql`
  mutation WidgetTicketCreated(
    $name: String!
    $statusId: String!
    $customerIds: [String!]!
    $description: String
    $attachments: [AttachmentInput]
    $tagIds: [String!]
  ) {
    widgetTicketCreated(
      name: $name
      statusId: $statusId
      customerIds: $customerIds
      description: $description
      attachments: $attachments
      tagIds: $tagIds
    ) {
      _id
      number
    }
  }
`;

const SAVE_CUSTOMER_NOTIFIED = gql`
  mutation WidgetsSaveCustomerGetNotified(
    $type: String!
    $value: String!
    $customerId: String
    $visitorId: String
  ) {
    widgetsSaveCustomerGetNotified(
      type: $type
      value: $value
      customerId: $customerId
      visitorId: $visitorId
    )
  }
`;

const TICKET_NUMBER_FORGET = gql`
  mutation WidgetTicketCheckProgressForget(
    $email: String
    $phoneNumber: String
  ) {
    widgetTicketCheckProgressForget(email: $email, phoneNumber: $phoneNumber)
  }
`;

export {
  SAVE_TICKET_CUSTOMERS,
  CREATE_TICKET,
  SAVE_CUSTOMER_NOTIFIED,
  TICKET_NUMBER_FORGET,
};
