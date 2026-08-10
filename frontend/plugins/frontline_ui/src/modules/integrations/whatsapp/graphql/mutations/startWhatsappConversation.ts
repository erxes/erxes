import { gql } from '@apollo/client';

export const START_WHATSAPP_CONVERSATION = gql`
  mutation WhatsappStartConversation(
    $integrationId: String!
    $customerId: String!
    $templateName: String!
    $languageCode: String!
    $components: JSON
    $content: String!
  ) {
    whatsappStartConversation(
      integrationId: $integrationId
      customerId: $customerId
      templateName: $templateName
      languageCode: $languageCode
      components: $components
      content: $content
    )
  }
`;
