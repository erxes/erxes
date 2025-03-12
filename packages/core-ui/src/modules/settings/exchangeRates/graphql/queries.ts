const listParamsDef = `
  $page: Int
  $perPage: Int
  $searchValue: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  searchValue: $searchValue
`;

const exchangeRateFields = `
  _id
  date
  mainCurrency
  rateCurrency
  rate
  createdAt
  modifiedAt
`;

export const exchangeRatesMain = `
  query exchangeRatesMain(${listParamsDef}) {
    exchangeRatesMain(${listParamsValue}) {
      list {
        ${exchangeRateFields}
      }

      totalCount
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export default {
  exchangeRatesMain,
  configs,
};
