import type { AccountingAdjustDebtRateDetailQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
export type IAdjustDebtRate = GraphqlView<
  NonNullable<AccountingAdjustDebtRateDetailQuery['adjustDebtRateDetail']>
>;

export type IAdjustDebtRateDetail = NonNullable<
  IAdjustDebtRate['details']
>[number];
