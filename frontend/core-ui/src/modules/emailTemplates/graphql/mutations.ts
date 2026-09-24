import { gql } from '@apollo/client';

const TEMPLATE_ARGS = `
  $name: String!
  $description: String
  $content: String
  $contentJson: JSON
  $contentFormat: String
`;

const TEMPLATE_VALUES = `
  name: $name
  description: $description
  content: $content
  contentJson: $contentJson
  contentFormat: $contentFormat
`;

export const EMAIL_TEMPLATE_ADD = gql`
  mutation EmailTemplateAdd(${TEMPLATE_ARGS}) {
    emailTemplateAdd(${TEMPLATE_VALUES}) {
      _id
      name
      description
      content
      contentJson
      contentFormat
    }
  }
`;

export const EMAIL_TEMPLATE_EDIT = gql`
  mutation EmailTemplateEdit($_id: String!, ${TEMPLATE_ARGS}) {
    emailTemplateEdit(_id: $_id, ${TEMPLATE_VALUES}) {
      _id
      name
      description
      content
      contentJson
      contentFormat
    }
  }
`;

export const EMAIL_TEMPLATE_REMOVE = gql`
  mutation EmailTemplateRemove($_id: String!) {
    emailTemplateRemove(_id: $_id)
  }
`;
