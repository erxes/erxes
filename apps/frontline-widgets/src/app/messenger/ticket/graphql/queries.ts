import { gql } from '@apollo/client';

const GET_TICKET_CUSTOMER_DETAILS = gql`
  query WidgetsTicketCustomerDetail($customerId: String, $type: String) {
    widgetsTicketCustomerDetail(customerId: $customerId, type: $type) {
      _id
      avatar
      email
      phone
      firstName
      lastName
    }
  }
`;

const GET_WIDGET_TAGS = gql`
  query WidgetsGetTicketTags($configId: String) {
    widgetsGetTicketTags(configId: $configId) {
      _id
      name
      type
      description
    }
  }
`;

export { GET_TICKET_CUSTOMER_DETAILS, GET_WIDGET_TAGS };
