import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

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
    $searchValue: String
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    exchangeRatesMain(
      searchValue: $searchValue
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        ${exchangeRateFields}
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const currencyConfig = gql`
  query ExchangeRateCurrencies {
    dealCurrencies: configsGetValue(code: "dealCurrency")
    mainCurrencyConfig: configsGetValue(code: "mainCurrency")
  }
`;

/* ---------------- default export ---------------- */

export default {
  exchangeRatesMain,
  currencyConfig,
};
