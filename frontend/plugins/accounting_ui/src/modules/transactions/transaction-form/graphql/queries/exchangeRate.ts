import { gql } from '~/gql';

export const EXCHANGE_GET_RATE_QUERY = gql(`
query accountingExchangeGetRate($date: Date, $currency: String, $mainCurrency: String) {
  exchangeGetRate(date: $date, currency: $currency, mainCurrency: $mainCurrency) {
    _id
    date
    mainCurrency
    rateCurrency
    rate
  }
}
`);
