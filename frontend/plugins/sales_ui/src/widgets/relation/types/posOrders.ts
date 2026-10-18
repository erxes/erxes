import type { PosOrdersByDealQuery } from '~/gql/graphql';

export type IDealPosOrder = NonNullable<
  NonNullable<PosOrdersByDealQuery['posOrders']>[number]
> & { _id: string };
