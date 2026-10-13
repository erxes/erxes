import { gql } from '~/gql';

export const GET_CYCLE_PROGRESS_BY_PROJECT = gql(`
  query getCycleProgressByProject($_id: String!, $assigneeId: String) {
    getCycleProgressByProject(_id: $_id, assigneeId: $assigneeId) {
      projectId
      totalScope
      totalStartedScope
      totalCompletedScope
    }
  }
`);
