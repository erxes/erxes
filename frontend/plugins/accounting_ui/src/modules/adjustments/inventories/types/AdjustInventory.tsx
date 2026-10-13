import type {
  AccountingAdjustInventoryDetailQuery,
  AccountingAdjustInventoryDetailsQuery,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type IAdjustInventory = GraphqlView<
  NonNullable<AccountingAdjustInventoryDetailQuery['adjustInventoryDetail']>
>;

export type IAdjustInvDetail = GraphqlView<
  NonNullable<
    NonNullable<
      AccountingAdjustInventoryDetailsQuery['adjustInventoryDetails']
    >[number]
  >
>;

export const ADJ_INV_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  all: ['draft', 'publish', 'running', 'process', 'complete'],
};
