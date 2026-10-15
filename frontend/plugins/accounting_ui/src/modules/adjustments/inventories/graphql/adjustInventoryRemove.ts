import { gql } from '~/gql';

export const ADJUST_INVENTORY_REMOVE = gql(`
mutation accountingAdjustInventoryRemove($adjustId: String!) {
  adjustInventoryRemove(adjustId: $adjustId)
}
`);
