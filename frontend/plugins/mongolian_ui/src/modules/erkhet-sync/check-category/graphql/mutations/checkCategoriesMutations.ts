import { gql } from '~/gql';

export const checkCategoriesMutation = gql(`
  mutation erkhetCheckCategories($categoryCodes: [String]) {
    toCheckCategories(categoryCodes: $categoryCodes) {
      create {
        items
        count
      }
      update {
        items
        count
      }
      delete {
        items
        count
      }
    }
  }
`);
