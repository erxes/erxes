import { gql } from '~/gql';

export const GET_ACCOUNTING_CONFIGS = gql(`
query AccountingsConfigs($code: String!) {
  accountingsConfigs(code: $code) {
    _id
    code
    subId
    value
  }
}
`);

export const GET_ACCOUNTING_CONFIG = gql(`
query accountingsConfig($code: String!, $subId: String) {
  accountingsConfig(code: $code, subId: $subId) {
    _id
    code
    subId
    value
  }
}
`);

export const CONFIGS_BY_CODE = gql(`
query accountingsConfigsByCode($codes: [String!]!) {
  accountingsConfigsByCode(codes: $codes)
}
`);

export const GET_RATE = gql(`
query accountingSettingsExchangeGetRate($currency: String, $date: Date) {
  exchangeGetRate(currency: $currency, date: $date) {
    _id
    createdAt
    modifiedAt
    date
    mainCurrency
    rateCurrency
    rate
  }
}
`);
