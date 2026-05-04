import { gql } from '@apollo/client';

export const ADJUST_CLOSING_REMOVE = gql`
  mutation AdjustClosingRemove($_id: String!) {
    adjustClosingRemove(_id: $_id)
  }
`;
