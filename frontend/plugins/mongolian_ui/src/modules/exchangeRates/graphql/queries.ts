import gql from 'graphql-tag';

/* ---------------- exchange rate fields ---------------- */

const exchangeRateFields = `
  _id
  date
  mainCurrency
  rateCurrency
  rate
  createdAt
  modifiedAt
`;

/* ---------------- queries ---------------- */

export const exchangeRatesMain = gql`
  query ExchangeRatesMain(
    $page: Int
    $perPage: Int
    $searchValue: String
  ) {
    exchangeRatesMain(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
    ) {
      list {
        ${exchangeRateFields}
      }
      totalCount
    }
  }
`;

export const currencyConfig = gql`
  query ExchangeRateMainCurrency {
    configsGetValue(code: "mainCurrency")
  }
`;

/* ---------------- default export ---------------- */

export default {
  exchangeRatesMain,
  currencyConfig,
};
