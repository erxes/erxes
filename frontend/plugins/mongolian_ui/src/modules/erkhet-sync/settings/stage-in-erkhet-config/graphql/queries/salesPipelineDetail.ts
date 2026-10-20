import { gql } from '~/gql';

export const GET_SALES_PIPELINE_DETAIL = gql(`
  query erkhetSalesPipelineDetail($_id: String!) {
    salesPipelineDetail(_id: $_id) {
      _id
      name
      paymentIds
      paymentTypes
    }
  }
`);
