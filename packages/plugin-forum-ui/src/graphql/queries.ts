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

export const CATEGORY_DETAIL = gql`
  query ForumCategoryDetail($id: ID!) {
    forumCategory(_id: $id) {
      _id
      code
      name
      parentId
      thumbnail
    }
  }
`;

export const CATEGORY_POSSIBLE_PARENTS = gql`
  query ForumCategoryPossibleParents($id: ID) {
    forumCategoryPossibleParents(_id: $id) {
      _id
      name
    }
  }
`;

export const FORUM_POSTS_QUERY = gql`
  query ForumPostsQuery(
    $categoryId: [ID!]
    $categoryIncludeDescendants: Boolean
    $limit: Int
    $offset: Int
    $state: [String!]
  ) {
    forumPosts(
      categoryId: $categoryId
      categoryIncludeDescendants: $categoryIncludeDescendants
      limit: $limit
      offset: $offset
      state: $state
    ) {
      _id
      content
      title
      state
      thumbnail
      categoryId
    }
  }
`;
