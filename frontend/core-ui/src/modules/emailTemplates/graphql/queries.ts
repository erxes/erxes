import { gql } from '@apollo/client';

const EMAIL_TEMPLATE_FIELDS = `
  _id
  name
  description
  content
  contentJson
  contentFormat
  createdBy
  createdAt
  updatedAt
  createdUser {
    _id
    details {
      fullName
    }
  }
`;

export const EMAIL_TEMPLATES = gql`
  query EmailTemplates(
    $page: Int
    $perPage: Int
    $searchValue: String
    $sortField: String
    $sortDirection: Int
  ) {
    emailTemplates(
      page: $page
      perPage: $perPage
      searchValue: $searchValue
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        ${EMAIL_TEMPLATE_FIELDS}
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

export const EMAIL_TEMPLATE_DETAIL = gql`
  query EmailTemplateDetail($id: String!) {
    emailTemplateDetail(_id: $id) {
      ${EMAIL_TEMPLATE_FIELDS}
    }
  }
`;

export const EMAIL_CONTENT_PREVIEW = gql`
  query EmailContentPreview(
    $content: String
    $contentJson: JSON
    $contentFormat: String
    $previewText: String
    $payloads: JSON
  ) {
    emailContentPreview(
      content: $content
      contentJson: $contentJson
      contentFormat: $contentFormat
      previewText: $previewText
      payloads: $payloads
    )
  }
`;
