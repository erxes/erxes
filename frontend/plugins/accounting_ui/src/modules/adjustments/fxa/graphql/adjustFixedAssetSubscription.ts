import { gql } from '@apollo/client';
import { adjustFixedAssetFields } from './adjustFixedAssetQueries';

export const ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED = gql`
  subscription AccountingAdjustFixedAssetChanged($adjustId: String!) {
    accountingAdjustFixedAssetChanged(adjustId: $adjustId) {
      ${adjustFixedAssetFields}
    }
  }
`;

export default {
  ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED,
};
