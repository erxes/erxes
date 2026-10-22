import type { DealPaymentsData, toDealDetail } from '@/deals/utils/dealJson';
import type {
  SalesDealListQuery,
  SalesDealSearchDropdownQuery,
} from '~/gql/graphql';

export type IDealList = NonNullable<SalesDealListQuery['deals']>;
export type IDeal = NonNullable<NonNullable<IDealList['list']>[number]>;
export type IDealDetail = ReturnType<typeof toDealDetail>;
export type IDealSearch = NonNullable<
  NonNullable<
    NonNullable<SalesDealSearchDropdownQuery['deals']>['list']
  >[number]
>;

export type IPaymentsData = DealPaymentsData;
