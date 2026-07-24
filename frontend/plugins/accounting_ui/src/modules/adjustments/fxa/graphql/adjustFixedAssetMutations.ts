import { gql } from '@apollo/client';
import { adjustFixedAssetFields } from './adjustFixedAssetQueries';

const adjustFixedAssetInputParamDefs = `
  $date: Date
  $description: String
  $beginDate: Date
  $successDate: Date
  $checkedAt: Date
`;

const adjustFixedAssetInputParams = `
  date: $date
  description: $description
  beginDate: $beginDate
  successDate: $successDate
  checkedAt: $checkedAt
`;

export const ADJUST_FIXED_ASSET_ADD = gql`
  mutation AdjustFixedAssetAdd(${adjustFixedAssetInputParamDefs}) {
    adjustFixedAssetAdd(${adjustFixedAssetInputParams}) {
      ${adjustFixedAssetFields}
    }
  }
`;

export const ADJUST_FIXED_ASSET_REMOVE = gql`
  mutation AdjustFixedAssetRemove($adjustId: String!) {
    adjustFixedAssetRemove(adjustId: $adjustId)
  }
`;

export const ADJUST_FIXED_ASSET_RUN = gql`
  mutation AdjustFixedAssetRun($adjustId: String!) {
    adjustFixedAssetRun(adjustId: $adjustId) {
      ${adjustFixedAssetFields}
    }
  }
`;

export const ADJUST_FIXED_ASSET_TRANSACTION = gql`
  mutation AdjustFixedAssetTransaction(
    $adjustId: String!
    $expenseAccountId: String!
  ) {
    adjustFixedAssetTransaction(
      adjustId: $adjustId
      expenseAccountId: $expenseAccountId
    ) {
      ${adjustFixedAssetFields}
    }
  }
`;
