import { gql } from '@apollo/client';

export const MAIN_CONFIGS = gql`
  query accountingsConfigs {
    accountingsConfigs {
      _id
      code
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
