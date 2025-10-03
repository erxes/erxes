import { gql } from '@apollo/client';
import { adjustInventoryFields } from './adjustInventoryQueries';

export const ADJUST_INVENTORY_PUBLISH = gql`
  mutation AdjustInventoryPublish($adjustId: String!) {
    adjustInventoryPublish(adjustId: $adjustId) {
      ${adjustInventoryFields}
    }
  }
`;

export const ADJUST_INVENTORY_CANCEL = gql`
  mutation AdjustInventoryCancel($adjustId: String!) {
    adjustInventoryCancel(adjustId: $adjustId) {
      ${adjustInventoryFields}
    }
  }
`;

export const ADJUST_INVENTORY_RUN = gql`
  mutation AdjustInventoryRun($adjustId: String!) {
    adjustInventoryRun(adjustId: $adjustId) {
      ${adjustInventoryFields}
    }
  }
`;
