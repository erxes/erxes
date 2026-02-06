import gql from 'graphql-tag';

/* ---------------- common fields ---------------- */

const commonParamsDef = `
  $date: Date
  $mainCurrency: String
  $rateCurrency: String
  $rate: Float
`;

const commonParams = `
  date: $date
  mainCurrency: $mainCurrency
  rateCurrency: $rateCurrency
  rate: $rate
`;

/* ---------------- mutations ---------------- */

export const exchangeRateAdd = gql`
  mutation ExchangeRateAdd(${commonParamsDef}) {
    exchangeRateAdd(
      ${commonParams}
    ) {
      _id
    }
  }
`;

export const exchangeRateEdit = gql`
  mutation ExchangeRateEdit(
    $_id: String!
    ${commonParamsDef}
  ) {
    exchangeRateEdit(
      _id: $_id
      ${commonParams}
    ) {
      _id
    }
  }
`;

export const exchangeRatesRemove = gql`
  mutation ExchangeRatesRemove($rateIds: [String!]!) {
    exchangeRatesRemove(rateIds: $rateIds)
  }
`;

/* ---------------- default export ---------------- */

export default {
  exchangeRateAdd,
  exchangeRateEdit,
  exchangeRatesRemove,
};
