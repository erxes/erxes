import { gql } from '@apollo/client';

export const GET_SALES_STAGE = gql`
  query salesStages($pipelineId: String!) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
      order
      pipelineId
    }
  }
`;
