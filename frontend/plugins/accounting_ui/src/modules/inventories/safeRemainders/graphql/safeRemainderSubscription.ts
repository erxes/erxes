import { gql } from '@apollo/client';
import { safeRemainderFields } from './safeRemainderQueries';

export const ACCOUNTING_SAFE_REMAINDER_CHANGED = gql`
  subscription AccountingSafeRemainderChanged($adjustId: String!) {
    accountingSafeRemainderChanged(adjustId: $adjustId) {
      ${safeRemainderFields}
    }
  }
`;

export default {
  ACCOUNTING_SAFE_REMAINDER_CHANGED,
};
