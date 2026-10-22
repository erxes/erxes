import { gql } from '~/gql';

export const PIPELINE_LIST_CHANGED = gql(`
  subscription salesPipelineListChanged {
    salesPipelineListChanged {
      _id
      action
      data
    }
  }
`);
