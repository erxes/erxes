import { gql } from '@apollo/client';
import {
  safeRemainderFields,
  safeRemainderItemFields,
} from './safeRemainderQueries';

export const SAFE_REMAINDER_RECALC = gql`
  mutation SafeRemainderReCalc($_id: String!) {
    safeRemainderReCalc(_id: $_id)
  }
`;
export const SAFE_REMAINDER_SUBMIT = gql`
  mutation SafeRemainderSubmit($_id: String!) {
    safeRemainderSubmit(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;
export const SAFE_REMAINDER_CANCEL = gql`
  mutation SafeRemainderCancel($_id: String!) {
    safeRemainderCancel(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;
export const SAFE_REMAINDER_DO_TR = gql`
  mutation SafeRemainderDoTr($_id: String!) {
    safeRemainderDoTr(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;
export const SAFE_REMAINDER_UNDO_TR = gql`
  mutation SafeRemainderUndoTr($_id: String!) {
    safeRemainderUndoTr(_id: $_id) {
      ${safeRemainderFields}
    }
  }
`;

export const SAFE_REMAINDER_EDIT = gql`
  mutation SafeRemainderEdit(
    $_id: String,
    $description: String,
    $incomeRule: JSON,
    $outRule: JSON,
    $saleRule: JSON,
  ) {
    safeRemainderEdit(
      _id: $_id,
      description: $description,
      incomeRule: $incomeRule,
      outRule: $outRule,
      saleRule: $saleRule,
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

// items:
export const SAFE_REMAINDER_ITEM_EDIT = gql`
  mutation SafeRemainderItemEdit(
    $_id: String,
    $status: String,
    $remainder: Float,
    $trInfo: JSON,
  ) {
    safeRemainderItemEdit(
      _id: $_id,
      status: $status,
      remainder: $remainder,
      trInfo: $trInfo,
    ) {
      ${safeRemainderItemFields}
    }
  }
`;

export const SAFE_REMAINDER_ITEMS_REMOVE = gql`
  mutation SafeRemainderItemsRemove($ids: [String]) {
    safeRemainderItemsRemove(ids: $ids)
  }
`;
