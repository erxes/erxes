import { gql } from '@apollo/client';

export const GET_WHATSAPP_SENDER_INTEGRATIONS = gql`
  query WhatsappSenderIntegrations {
    whatsappSenderIntegrations {
      _id
      name
      displayPhoneNumber
    }
  }
`;

export const GET_WHATSAPP_INTEGRATION_TEMPLATES = gql`
  query WhatsappIntegrationTemplates($integrationId: String!) {
    whatsappIntegrationTemplates(integrationId: $integrationId) {
      id
      name
      language
      status
      category
      components {
        type
        format
        text
        buttons {
          type
          text
          url
          phone_number
        }
      }
    }
  }
`;

export const GET_WHATSAPP_TEMPLATES = gql`
  query WhatsappTemplates($conversationId: String!) {
    whatsappTemplates(conversationId: $conversationId) {
      id
      name
      language
      status
      category
      components {
        type
        format
        text
        buttons {
          type
          text
          url
          phone_number
        }
      }
    }
  }
`;
