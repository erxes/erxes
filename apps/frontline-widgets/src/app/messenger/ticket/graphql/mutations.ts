import { gql } from '@apollo/client';

const SAVE_TICKET_CUSTOMERS = gql`
  mutation WidgetsTicketCustomersEdit(
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
    }
  }
`;

const CREATE_TICKET = gql`
  mutation WidgetTicketCreated(
    $name: String!
    $statusId: String!
    $description: String
    $attachments: [AttachmentInput]
    $tagIds: [String!]
    $propertiesData: JSON
  ) {
    widgetTicketCreated(
      name: $name
      statusId: $statusId
      description: $description
      attachments: $attachments
      tagIds: $tagIds
      propertiesData: $propertiesData
    ) {
      _id
      number
    }
  }
`;

export { SAVE_TICKET_CUSTOMERS, CREATE_TICKET };
