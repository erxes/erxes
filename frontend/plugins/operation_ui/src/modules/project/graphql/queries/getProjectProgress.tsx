import { gql } from '~/gql';

export const GET_PROJECT_PROGRESS = gql(`
  query getProjectProgress($_id: String!) {
    getProjectProgress(_id: $_id) {
      totalScope
      totalStartedScope
      totalCompletedScope
    }
  }
`);
