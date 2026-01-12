import { gql } from '@apollo/client';

export const checkCategoriesMutation = gql`
  mutation toCheckCategories($categoryCodes: [String]) {
    toCheckCategories(categoryCodes: $categoryCodes)
  }
`;
