import gql from 'graphql-tag';

const paymentsQuery = gql`
  query PaymentConfigs($status: String) {
    paymentConfigs(status: $status) {
      _id
      name
      kind
    }
  }
`;

export default {
  paymentsQuery
};
