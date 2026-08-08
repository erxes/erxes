import { gql } from '@apollo/client';

export const DEAL_CHANGED = gql`
  subscription DealChanged($pipelineId: String) {
    dealChanged(pipelineId: $pipelineId) {
      mutation
      data
    }
  }
`;