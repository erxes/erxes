import { gql } from '@apollo/client';

export const PIPELINE_LIST_CHANGED = gql`
  subscription salesPipelineListChanged {
    salesPipelineListChanged {
      _id
      action
      data
    }
  }
`;
