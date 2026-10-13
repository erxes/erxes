import { gql } from '~/gql';

export const GET_CYCLE_PROGRESS = gql(`
  query getCycleProgress($_id: String!, $assigneeId: String) {
    getCycleProgress(_id: $_id, assigneeId: $assigneeId) {
      totalScope
      totalStartedScope
      totalCompletedScope
    }
  }
`);
