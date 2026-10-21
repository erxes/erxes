import { gql } from '~/gql';

export const PIPELINE_CHANGED = gql(`
  subscription salesPipelinesChanged($_id: String!) {
    salesPipelinesChanged(_id: $_id) {
      _id
      processId
      action
      data
    }
  }
`);
