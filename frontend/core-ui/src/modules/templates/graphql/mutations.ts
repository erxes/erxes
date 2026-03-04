import { gql } from '@apollo/client';

export const REMOVE_TICKETS = gql`
  mutation TemplateRemove($_ids: [String!]) {
    templateRemove(_ids: $_ids)
  }
`;

export const USE_TEMPLATE = gql`
  mutation TemplateUse($id: String!) {
    templateUse(_id: $id)
  }
`;
