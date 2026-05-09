import { gql } from '@apollo/client';

export const WEB_PAGES_EDIT = gql`
  mutation WebPagesEdit($_id: String!, $input: WebPageInput!) {
    webPagesEdit(_id: $_id, input: $input) {
      _id
      webId
      name
      slug
      pageItems {
        _id
        name
        type
        content
        order
        contentType
        contentTypeId
        config
      }
    }
  }
`;
