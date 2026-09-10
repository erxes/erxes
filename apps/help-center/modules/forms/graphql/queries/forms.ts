import { gql } from '@apollo/client';

const FORM_FIELDS = `
  fields {
    _id
    type
    text
    description
    content
    isRequired
    options
    validation
    order
  }
`;

export const FORM_PORTAL_LIST = gql`
  query kbFormList($channelId: String, $limit: Int) {
    cpForms(channelId: $channelId, status: "active", limit: $limit) {
      list {
        _id
        title
        name
        description
        tagIds
      }
    }
  }
`;

export const FORM_PORTAL_DETAIL = gql`
  query kbFormDetail($_id: String!) {
    cpFormDetail(_id: $_id) {
      _id
      title
      name
      description
      buttonText
      tagIds
      ${FORM_FIELDS}
    }
  }
`;
