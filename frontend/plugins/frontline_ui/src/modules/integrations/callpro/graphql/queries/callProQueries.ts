import { gql } from '@apollo/client';

export const CALL_PRO_CONFIG = gql`
  query callProConfig {
    callProConfig {
      enabled
      webhookUrl
    }
  }
`;

export const CALL_PRO_INTEGRATION_DETAIL = gql`
  query callProIntegrationDetail($integrationId: String!) {
    callProIntegrationDetail(integrationId: $integrationId) {
      phoneNumber
      recordUrl
    }
  }
`;

export const CALL_PRO_CUSTOMERS_BY_PHONE = gql`
  query callProCustomersByPhone($phone: String!) {
    callProCustomersByPhone(phone: $phone)
  }
`;
