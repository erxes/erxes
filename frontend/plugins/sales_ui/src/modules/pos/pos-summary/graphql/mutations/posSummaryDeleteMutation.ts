import { gql } from '@apollo/client';

export const DELETE_POS_SUMMARY_MUTATION = gql`
  mutation posSummaryRemove($ids: [String!]!) {
    posSummaryRemove(ids: $ids)
  }
`;
