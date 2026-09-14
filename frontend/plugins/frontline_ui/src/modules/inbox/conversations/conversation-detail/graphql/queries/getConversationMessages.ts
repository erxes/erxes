import { gql } from '@apollo/client';
import { ATTACHMENT_GQL } from 'erxes-ui';
import { VIBER_DELIVERY_FIELDS } from '@/integrations/viber/graphql';

export const GET_CONVERSATION_MESSAGES = gql`
  query ConversationMessages(
    $conversationId: String!
    $skip: Int
    $limit: Int
    $getFirst: Boolean
  ) {
    conversationMessages(
      conversationId: $conversationId
      skip: $skip
      limit: $limit
      getFirst: $getFirst
    ) {
      _id
      conversationId
      content
      formWidgetData
      extraData
      ...FrontlineViberDeliveryFields
      ${ATTACHMENT_GQL}
      internal
      fromBot
      createdAt
      isCustomerRead
      userId
      customerId
      fromBot
      botData
    }
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
  ${VIBER_DELIVERY_FIELDS}
`;
