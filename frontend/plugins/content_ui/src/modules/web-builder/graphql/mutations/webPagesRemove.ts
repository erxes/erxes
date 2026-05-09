import { gql } from '@apollo/client';

export const WEB_PAGES_REMOVE = gql`
  mutation WebPagesRemove($_id: String!) {
    webPagesRemove(_id: $_id)
  }
`;
