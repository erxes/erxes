import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

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
    $searchValue: String,
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    emailTemplates(
      searchValue: $searchValue,
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        ${EMAIL_TEMPLATE_FIELDS}
      }
      ${GQL_PAGE_INFO}
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
    $contentFormat: String
    $replacerId: String
  ) {
    emailContentPreview(
      content: $content
      contentFormat: $contentFormat
      replacerId: $replacerId
    )
  }
`;
