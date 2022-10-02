import { gql } from '@apollo/client';

const createInvoice = gql`
  mutation createInvoice(
    $paymentConfigId: String!
    $amount: Float
    $companyId: String
    $contentType: String
    $contentTypeId: String
    $customerId: String
    $description: String
    $email: String
    $phone: String
  ) {
    createInvoice(
      paymentConfigId: $paymentConfigId
      amount: $amount
      companyId: $companyId
      contentType: $contentType
      contentTypeId: $contentTypeId
      customerId: $customerId
      description: $description
      email: $email
      phone: $phone
    ) {
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

const mutations = { createInvoice };

export default mutations;
