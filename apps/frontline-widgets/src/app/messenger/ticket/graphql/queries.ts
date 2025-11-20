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

export { GET_TICKET_CUSTOMER_DETAILS };
