import { gql } from '@apollo/client';

export const REMOVE_TICKETS = gql`
  mutation TemplateRemove($_ids: [String!]) {
    templateRemove(_ids: $_ids)
  }
`;
