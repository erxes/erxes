import type { AccountingAdjustFundRateDetailQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
export type IAdjustFundRate = GraphqlView<
  NonNullable<AccountingAdjustFundRateDetailQuery['adjustFundRateDetail']>
>;

export type IAdjustFundRateDetail = NonNullable<
  IAdjustFundRate['details']
>[number];
