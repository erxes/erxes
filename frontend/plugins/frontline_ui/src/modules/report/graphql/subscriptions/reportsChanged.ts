import { gql } from '~/gql';

export const FRONTLINE_REPORTS_CHANGED = gql(`
  subscription FrontlineReportsChanged {
    frontlineReportsChanged {
      scopes
    }
  }
`);
