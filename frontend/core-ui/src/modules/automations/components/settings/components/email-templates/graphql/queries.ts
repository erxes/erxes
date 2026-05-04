import { gql } from '@apollo/client';

export const AUTOMATION_EMAIL_TEMPLATES = gql`
  query AutomationEmailTemplates(
    $page: Int
    $perPage: Int
    $searchValue: String
    $sortField: String
    $sortDirection: Int
  ) {
    automationEmailTemplates(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        _id
        name
        description
        content
        createdBy
        createdAt
        updatedAt
        createdUser {
          _id
          details {
            fullName
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const AUTOMATION_EMAIL_TEMPLATE_DETAIL = gql`
  query AutomationEmailTemplateDetail($id: String!) {
    automationEmailTemplateDetail(_id: $id) {
      _id
      name
      description
      content
      createdBy
      createdAt
      updatedAt
      createdUser {
        _id
        details {
          fullName
        }
      }
    }
  }
`;
