import { gql } from '~/gql';

/* ---------------- queries ---------------- */

export const exchangeRatesMain = gql(`
  query exchangeRatesMain(
    $searchValue: String
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    exchangeRatesMain(
      searchValue: $searchValue
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        date
        mainCurrency
        rateCurrency
        rate
        createdAt
        modifiedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const currencyConfig = gql(`
  query exchangeRateCurrencies {
    dealCurrencies: configsGetValue(code: "dealCurrency")
    mainCurrencyConfig: configsGetValue(code: "mainCurrency")
  }
`);

/* ---------------- default export ---------------- */

export default {
  exchangeRatesMain,
  currencyConfig,
};
