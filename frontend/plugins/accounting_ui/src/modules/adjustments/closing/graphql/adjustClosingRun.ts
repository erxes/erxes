import { gql } from '@apollo/client';

export const ADJUST_CLOSING_RUN = gql`
  mutation AdjustClosingRun($_id: String!) {
    adjustClosingRun(_id: $_id) {
      _id
      status
    }
  }
`;
