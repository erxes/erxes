import type {
  SalesPosOrdersCompaniesQuery,
  SalesPosOrdersUsersQuery,
} from '~/gql/graphql';

// These selector rows use identical selections in each POS report.
export type PosCompany = NonNullable<
  NonNullable<
    NonNullable<SalesPosOrdersCompaniesQuery['companies']>['list']
  >[number]
> & { _id: string };

export type PosUser = NonNullable<
  NonNullable<SalesPosOrdersUsersQuery['posUsers']>[number]
>;
