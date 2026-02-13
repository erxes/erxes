import { gql } from '@apollo/client';
import { safeRemainderFields } from './safeRemainderQueries';

export const SAFE_REMAINDER_SUBMIT = gql`
  mutation SafeRemainderSubmit($_id: String!) {
    safeRemainderSubmit(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;
