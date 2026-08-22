import { gql } from '@apollo/client';

export const GET_WHATSAPP_BUSINESS_ACCOUNTS = gql`
  query WhatsappGetBusinessAccounts($accountId: String!, $pageId: String) {
    whatsappGetBusinessAccounts(accountId: $accountId, pageId: $pageId)
  }
`;
