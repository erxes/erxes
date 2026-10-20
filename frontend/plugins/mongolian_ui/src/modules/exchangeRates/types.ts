import type { ExchangeRatesMainQuery } from '~/gql/graphql';

export type IExchangeRate = NonNullable<
  NonNullable<
    NonNullable<ExchangeRatesMainQuery['exchangeRatesMain']>['list']
  >[number]
>;
