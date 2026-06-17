import { gql } from '@apollo/client';

// Fetches form submissions linked to a deal — either by the customer who
// submitted, or by the originating conversation (a converted deal's
// sourceConversationIds map to a submission's contentTypeId).
export const GET_DEAL_FORM_SUBMISSIONS = gql`
  query DealFormSubmissions(
    $customerId: String
    $contentTypeIds: [String]
    $limit: Int
  ) {
    formSubmissions(
      customerId: $customerId
      contentTypeIds: $contentTypeIds
      limit: $limit
    ) {
      totalCount
      list {
        _id
        customerId
        contentTypeId
        createdAt
        formId
        submissions {
          _id
          formFieldId
          formFieldText
          formFieldType
          text
          value
          submittedAt
        }
      }
    }
  }
`;

export const GET_FORM_TITLE = gql`
  query FormDetail($_id: String!) {
    formDetail(_id: $_id) {
      _id
      title
      name
    }
  }
`;

// The richest, canonical source of a submitted form is the `formWidgetData`
// stored on the conversation's message (this is what the inbox renders too),
// keyed purely by conversationId.
export const GET_CONVERSATION_FORM_WIDGET = gql`
  query DealConversationFormWidget($conversationId: String!, $limit: Int) {
    conversationMessages(conversationId: $conversationId, limit: $limit) {
      _id
      content
      formWidgetData
      createdAt
    }
  }
`;
