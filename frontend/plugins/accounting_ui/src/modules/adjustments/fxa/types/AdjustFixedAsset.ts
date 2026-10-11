import type {
  AccountingAdjustFixedAssetDetailQuery,
  AccountingAdjustFxaDetailsQuery,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type IAdjustFixedAsset = GraphqlView<
  NonNullable<AccountingAdjustFixedAssetDetailQuery['adjustFixedAssetDetail']>
>;

export type IAdjustFxaDetail = GraphqlView<
  NonNullable<
    NonNullable<AccountingAdjustFxaDetailsQuery['adjustFxaDetails']>[number]
  >
>;

export const ADJ_FXA_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  ALL: ['draft', 'publish', 'running', 'process', 'complete'],
};
