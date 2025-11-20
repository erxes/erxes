import { gql } from '@apollo/client';

const SAVE_TICKET_CUSTOMERS = gql`
  mutation WidgetsTicketCustomersEdit(
    $customerId: String
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
    $type: String!
    $customerIds: [String!]!
    $description: String
    $attachments: [AttachmentInput]
    $tagIds: [String!]
  ) {
    widgetTicketCreated(
      name: $name
      statusId: $statusId
      type: $type
      customerIds: $customerIds
      description: $description
      attachments: $attachments
      tagIds: $tagIds
    ) {
      _id
    }
  }
`;

export { SAVE_TICKET_CUSTOMERS, CREATE_TICKET };
