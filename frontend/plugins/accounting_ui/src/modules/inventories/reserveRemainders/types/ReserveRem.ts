import type { AccountingReserveRemsQuery } from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';
export type IReserveRem = GraphqlView<
  NonNullable<NonNullable<AccountingReserveRemsQuery['reserveRems']>[number]>
>;
