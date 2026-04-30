import { gql } from '@apollo/client';

export const GET_SALES_PIPELINE_DETAIL = gql`
  query salesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
      paymentTypes
    }
  }
`;
