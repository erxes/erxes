import { gql } from '~/gql';

export const syncCategoriesMutation = gql(`
  mutation erkhetSyncCategories($action: String, $categories: [JSON]) {
    toSyncCategories(action: $action, categories: $categories)
  }
`);
