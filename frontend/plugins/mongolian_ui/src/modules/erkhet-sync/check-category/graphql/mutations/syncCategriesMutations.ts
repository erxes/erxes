import { gql } from '@apollo/client';

export const syncCategoriesMutation = gql`
  mutation toSyncCategories($action: String, $categories: [JSON]) {
    toSyncCategories(action: $action, categories: $categories)
  }
`;
