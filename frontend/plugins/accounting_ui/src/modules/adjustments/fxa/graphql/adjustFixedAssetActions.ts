import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_CANCEL = gql(`
  mutation accountingAdjustFixedAssetCancel($adjustId: String!) {
    adjustFixedAssetCancel(adjustId: $adjustId) { _id status error warning }
  }
`);
export const ADJUST_FIXED_ASSET_CLEAR = gql(`
  mutation accountingAdjustFixedAssetClear($adjustId: String!) {
    adjustFixedAssetClear(adjustId: $adjustId) { _id status error warning }
  }
`);
export const ADJUST_FIXED_ASSET_PUBLISH = gql(`
  mutation accountingAdjustFixedAssetPublish($adjustId: String!) {
    adjustFixedAssetPublish(adjustId: $adjustId) { _id status error warning }
  }
`);
