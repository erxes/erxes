import { gql } from '@apollo/client';

const byDateRemove = gql`
  mutation byDateRemove($byDateIds: [String!]) {
    byDateRemove(byDateIds: $byDateIds)
  }
`;

export const byDateRemoveMutation = { byDateRemove };
