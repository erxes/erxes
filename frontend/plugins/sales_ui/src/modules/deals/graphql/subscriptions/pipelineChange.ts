import { gql } from '@apollo/client';

export const PIPELINE_CHANGED = gql`
  subscription salesPipelinesChanged($_id: String!) {
    salesPipelinesChanged(_id: $_id) {
      _id
      processId
      action
      data
    }
  }
`;
