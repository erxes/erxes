import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_REMOVE = gql(`
mutation accountingAdjustFixedAssetRemove($adjustId: String!) {
  adjustFixedAssetRemove(adjustId: $adjustId)
}
`);
