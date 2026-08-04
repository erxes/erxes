import { gql } from '@apollo/client';

export const PRODUCT_CATEGORY_DELETE_PREFLIGHT = gql`
  query ProductCategoryDeletePreflight($ids: [String!]!) {
    selectedDefault: productCategories(ids: $ids) {
      _id
      name
      productCount
    }
    selectedDisabled: productCategories(ids: $ids, status: "disabled") {
      _id
      name
      productCount
    }
    selectedArchived: productCategories(ids: $ids, status: "archived") {
      _id
      name
      productCount
    }
    activeDescendants: categoriesWithChilds(ids: $ids) {
      _id
      parentId
    }
    disabledCategories: productCategories(status: "disabled") {
      _id
      parentId
    }
    archivedCategories: productCategories(status: "archived") {
      _id
      parentId
    }
  }
`;
