import { gql } from '~/gql';

export const SAFE_REMAINDER_REMOVE = gql(`
mutation accountingSafeRemainderRemove($_id: String!) {
  safeRemainderRemove(_id: $_id)
}
`);
