import { gql } from '~/gql';

export const GET_PROJECT_PROGRESS_CHART = gql(`
  query getProjectProgressChart($_id: String!) {
    getProjectProgressChart(_id: $_id) {
      totalScope
      chartData {
        date
        started
        completed
      }
    }
  }
`);
