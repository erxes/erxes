import { gql } from '@apollo/client';

export const SAFE_REMAINDER_REMOVE = gql`
  mutation SafeRemainderRemove($_id: String!) {
    safeRemainderRemove(_id: $_id)
  }
`;
