import gql from 'graphql-tag';

export const allCategoryQueries = [
  'ForumCategoriesByParentIds',
  'ForumCategoryDetail',
  'ForumCategoryPossibleParents'
];

export const CATEGORIES_BY_PARENT_IDS = gql`
  query ForumCategoriesByParentIds($parentId: [ID]) {
    forumCategories(parentId: $parentId) {
      _id
      name
      thumbnail
    }
  }
`;
