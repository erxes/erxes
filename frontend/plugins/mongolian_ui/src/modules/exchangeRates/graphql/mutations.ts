import { gql } from '~/gql';

export const exchangeRateAdd = gql(`
  mutation exchangeRateAdd(
    $date: Date
    $mainCurrency: String
    $rateCurrency: String
    $rate: Float
  ) {
    exchangeRateAdd(
      date: $date
      mainCurrency: $mainCurrency
      rateCurrency: $rateCurrency
      rate: $rate
    ) {
      _id
    }
  }
`);

export const exchangeRateEdit = gql(`
  mutation exchangeRateEdit(
    $_id: String!
    $date: Date
    $mainCurrency: String
    $rateCurrency: String
    $rate: Float
  ) {
    exchangeRateEdit(
      _id: $_id
      date: $date
      mainCurrency: $mainCurrency
      rateCurrency: $rateCurrency
      rate: $rate
    ) {
      _id
    }
  }
`);

export const exchangeRatesRemove = gql(`
  mutation exchangeRatesRemove($rateIds: [String!]!) {
    exchangeRatesRemove(rateIds: $rateIds)
  }
`);

export default {
  exchangeRateAdd,
  exchangeRateEdit,
  exchangeRatesRemove,
};
