import { gql } from "@apollo/client";

const checkInvoiceQuery = gql`
  query checkInvoice($paymentConfigId: String!, $_id: String!) {
    checkInvoice(paymentConfigId: $paymentConfigId, _id: $_id) {
      _id
      amount
      apiResponse
      companyId
      contentType
      contentTypeId
      customerId
      description
      email
      paymentConfigId
      phone
      status
    }
  }
`;

const paymentConfigsQuery = gql`
  query paymentConfigs($paymentConfigIds: [String]) {
    paymentConfigs(paymentConfigIds: $paymentConfigIds) {
      _id
      name
      type
      status
      config
    }
  }
`;

const queries = { checkInvoiceQuery, paymentConfigsQuery };

export default queries;
