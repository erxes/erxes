import { gql } from '~/gql';

export const ADJUST_CLOSING_REMOVE = gql(`
mutation accountingAdjustClosingRemove($_id: String!) {
  adjustClosingRemove(_id: $_id)
}
`);
