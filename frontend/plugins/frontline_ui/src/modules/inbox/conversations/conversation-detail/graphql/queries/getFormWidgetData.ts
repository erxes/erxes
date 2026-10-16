import { gql } from '~/gql';

export const FORM_WIDGET_DATA = gql(`
  query FormWidgetData(
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
      content
      formWidgetData
      internal
      userId
      customerId
    }
  }
`);
