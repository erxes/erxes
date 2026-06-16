import { gql } from '@apollo/client';

export const GET_WHATSAPP_CONFIGS = gql`
  query WhatsappGetConfigs {
    whatsappGetConfigs
  }
`;
