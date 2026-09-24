import { gql } from '@apollo/client';

export const WHATSAPP_UPDATE_CONFIGS = gql`
  mutation WhatsappUpdateConfigs($configsMap: JSON!) {
    whatsappUpdateConfigs(configsMap: $configsMap)
  }
`;
