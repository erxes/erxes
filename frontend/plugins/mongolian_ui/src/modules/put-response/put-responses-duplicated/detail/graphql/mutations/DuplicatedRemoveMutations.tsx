import { gql } from '@apollo/client';

const duplicatedRemove = gql`
  mutation duplicatedRemove($duplicatedIds: [String!]) {
    duplicatedRemove(duplicatedIds: $duplicatedIds)
  }
`;

export const duplicatedRemoveMutation = { duplicatedRemove };
