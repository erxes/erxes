import { gql } from '@apollo/client';
import {
  safeRemainderFields,
  safeRemainderItemFields,
} from './safeRemainderQueries';

export const SAFE_REMAINDER_SUBMIT = gql`
  mutation SafeRemainderSubmit($_id: String!) {
    safeRemainderSubmit(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;

export const SAFE_REMAINDER_ITEM_EDIT = gql`
  mutation SafeRemainderItemEdit(
    $_id: String,
    $status: String,
    $remainder: Float,
  ) {
    safeRemainderItemEdit(
      _id: $_id,
      status: $status,
      remainder: $remainder,
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

export const SAFE_REMAINDER_ITEM_REMOVE = gql`
  mutation SafeRemainderItemRemove($_id: String) {
    safeRemainderItemRemove(_id: $_id)
  }
`;
