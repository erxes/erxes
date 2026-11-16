import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS, GQL_PAGE_INFO } from 'erxes-ui';

const CURRENCY_RATE_FIELDS = `
  _id
  date
  mainCurrency
  rateCurrency
  rate
  source
  createdBy
  createdAt
`;

export const CURRENCY_RATES = gql`
  query CurrencyRates(
    $rateCurrency: String
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    currencyRates(
      rateCurrency: $rateCurrency
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        ${CURRENCY_RATE_FIELDS}
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const CURRENCY_RATE_CURRENCIES = gql`
  query CurrencyRateCurrencies {
    dealCurrency: configsGetValue(code: "dealCurrency")
    mainCurrency: configsGetValue(code: "mainCurrency")
  }
`;

export const CURRENCY_RATE_ADD = gql`
  mutation CurrencyRateAdd($date: Date!, $rateCurrency: String!, $rate: Float!) {
    currencyRateAdd(date: $date, rateCurrency: $rateCurrency, rate: $rate) {
      ${CURRENCY_RATE_FIELDS}
    }
  }
`;

export const CURRENCY_RATE_EDIT = gql`
  mutation CurrencyRateEdit(
    $_id: String!
    $date: Date
    $rateCurrency: String
    $rate: Float
  ) {
    currencyRateEdit(
      _id: $_id
      date: $date
      rateCurrency: $rateCurrency
      rate: $rate
    ) {
      ${CURRENCY_RATE_FIELDS}
    }
  }
`;

export const CURRENCY_RATES_REMOVE = gql`
  mutation CurrencyRatesRemove($_ids: [String!]!) {
    currencyRatesRemove(_ids: $_ids)
  }
`;
