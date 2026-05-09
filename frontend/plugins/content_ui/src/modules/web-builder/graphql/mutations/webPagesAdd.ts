import { gql } from '@apollo/client';

export const WEB_PAGES_ADD = gql`
  mutation WebPagesAdd($input: WebPageInput!) {
    webPagesAdd(input: $input) {
      _id
      webId
      name
      slug
    }
  }
`;
