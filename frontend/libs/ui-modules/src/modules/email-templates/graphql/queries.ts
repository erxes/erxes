import { gql } from '@apollo/client';

export const EMAIL_TEMPLATE_PICKER_QUERY = gql`
  query frontlineMailEmailTemplates($searchValue: String, $cursor: String) {
    emailTemplates(searchValue: $searchValue, cursor: $cursor, limit: 30) {
      list {
        _id
        name
        description
        content
        contentJson
        contentFormat
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const EMAIL_TEMPLATE_CONTENT_QUERY = gql`
  query frontlineMailEmailTemplateContent(
    $content: String
    $contentFormat: String
  ) {
    emailContentPreview(content: $content, contentFormat: $contentFormat)
  }
`;
