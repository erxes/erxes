import { gql } from '@apollo/client';

export const GET_FORM_SUBMISSIONS = gql`
  query FormSubmissions(
    $formId: String
    $customerId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $cursorMode: CURSOR_MODE
    $filters: [SubmissionFilter]
  ) {
    formSubmissions(
      formId: $formId
      customerId: $customerId
      limit: $limit
      cursor: $cursor
      direction: $direction
      cursorMode: $cursorMode
      filters: $filters
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      list {
        _id
        customerId
        createdAt
        formId
        channelId
        submissions {
          _id
          customerId
          formId
          formFieldId
          text
          formFieldText
          formFieldType
          value
          submittedAt
        }
      }
    }
  }
`;
