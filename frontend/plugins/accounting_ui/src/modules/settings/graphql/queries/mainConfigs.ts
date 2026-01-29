import { gql } from '@apollo/client';

export const GET_ACCOUNTING_CONFIGS = gql`
  query accountingsConfigs($code: String!) {
    accountingsConfigs(code: $code) {
      _id
      code
      subId
      value
    }
  }
`;

export const GET_ACCOUNTING_CONFIG = gql`
  query accountingsConfigs($code: String!, $subId: String) {
    accountingsConfigs(code: $code, subId: $subId) {
      _id
      code
      subId
      value
    }
  }
`;

export const CONFIGS_BY_CODE = gql`
  query accountingsConfigsByCode($codes: [String]) {
    accountingsConfigsByCode(codes: $codes)
  }
`;

export const GET_RATE = gql`
  query exchangeGetRate($currency: String, $date: Date) {
    exchangeGetRate(currency: $currency, date: $date) {
      _id
      createdAt
      updatedAt
      date
      mainCurrency
      rateCurrency
      rate
    }
  }
`;
