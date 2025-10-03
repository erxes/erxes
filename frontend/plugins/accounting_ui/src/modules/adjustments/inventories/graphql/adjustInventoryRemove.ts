import { gql } from '@apollo/client';

export const ADJUST_INVENTORY_REMOVE = gql`
  mutation AdjustInventoryRemove($adjustId: String!) {
    adjustInventoryRemove(adjustId: $adjustId) 
  }
`;
