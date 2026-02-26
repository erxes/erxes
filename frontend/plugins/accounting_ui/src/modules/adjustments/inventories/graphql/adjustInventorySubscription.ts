import { gql } from '@apollo/client';
import { adjustInventoryFields } from './adjustInventoryQueries';

export const ACCOUNTING_ADJUST_INVENTORY_CHANGED = gql`
  subscription AccountingAdjustInventoryChanged($adjustId: String!) {
    accountingAdjustInventoryChanged(adjustId: $adjustId) {
      ${adjustInventoryFields}
    }
  }
`;

export default {
  ACCOUNTING_ADJUST_INVENTORY_CHANGED,
};
