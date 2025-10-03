import { gql } from '@apollo/client';

export const EXCHANGE_GET_RATE_QUERY = gql`
  query exchangeGetRate($date: Date, $currency: String, $mainCurrency: String) {
    exchangeGetRate(date: $date, currency: $currency, mainCurrency: $mainCurrency) {
      _id
      date
      mainCurrency
      rateCurrency
      rate
    }
  }
`;