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

const forumPostsParam = `$_id: [ID!], $categoryId: [ID!], $categoryIncludeDescendants: Boolean, $limit: Int, $offset: Int, $state: [String!]`;
const forumPostsArg = `_id: $_id, categoryId: $categoryId, categoryIncludeDescendants: $categoryIncludeDescendants, limit: $limit, offset: $offset, state: $state`;

export const POST_REFETCH_AFTER_CREATE_DELETE = [
  'ForumPostsQuery',
  'ForumPostsCount'
];

export const POST_REFETCH_AFTER_EDIT = [
  'ForumPostsQuery',
  'ForumPostDetail',
  'forumPost'
];

export const FORUM_POSTS_QUERY = gql`
  query ForumPostsQuery(${forumPostsParam}) {
    forumPosts(${forumPostsArg}) {
      _id
      content
      title
      state
      thumbnail
      categoryId
      createdAt
      updatedAt
    }
  }
`;

export const FORUM_POSTS_COUNT = gql`
  query ForumPostsCount(${forumPostsParam}) {
    forumPostsCount(${forumPostsArg})
  }
`;

export const FORUM_POST_DETAIL = gql`
  query ForumPostDetail($_id: ID!) {
    forumPost(_id: $_id) {
      _id
      category {
        _id
        code
        name
        thumbnail
      }
      categoryId
      content
      state
      thumbnail
      title
      createdAt
      updatedAt
    }
  }
`;
