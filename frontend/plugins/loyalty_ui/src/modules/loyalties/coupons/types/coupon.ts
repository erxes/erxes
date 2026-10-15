import type { CouponsMainQuery } from '~/gql/graphql';
export type ICoupon = NonNullable<
  NonNullable<NonNullable<CouponsMainQuery['coupons']>['list']>[number]
>;
