import gql from 'graphql-tag';

export const allCategoryQueries = [
  'ForumCategoriesByParentIds',
  'ForumCategoryDetail',
  'ForumCategoryPossibleParents',
  'allCategories'
];

export const CATEGORIES_ALL = gql`
  query allCategories {
    forumCategories {
      _id
      name
    }
  }
`;

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

const forumPostsParam = `$_id: [ID!], $categoryId: [ID!], $categoryIncludeDescendants: Boolean, $limit: Int, $offset: Int, $state: [ForumPostState!]`;
const forumPostsArg = `_id: $_id, categoryId: $categoryId, categoryIncludeDescendants: $categoryIncludeDescendants, limit: $limit, offset: $offset, state: $state`;

export const POST_REFETCH_AFTER_CREATE_DELETE = [
  'ForumPostsQuery',
  'ForumPostsCount'
];

export const POST_REFETCH_AFTER_EDIT = ['ForumPostsQuery', 'ForumPostDetail'];

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
      commentCount

      upVoteCount
      downVoteCount

      createdUserType
      createdBy {
        _id
        username
        email
      }
      createdByCp {
        _id
        email
        username
      }

      updatedUserType
      updatedBy {
        _id
        username
        email
      }
      updatedByCp {
        _id
        email
        username
      }

      stateChangedUserType
      stateChangedAt
      stateChangedBy {
        _id
        username
        email
      }
      stateChangedByCp {
        _id
        email
        username
      }
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
      stateChangedAt
      commentCount

      upVoteCount
      downVoteCount

      createdUserType
      createdBy {
        _id
        username
        email
      }
      createdByCp {
        _id
        email
        username
      }

      updatedUserType
      updatedBy {
        _id
        username
        email
      }
      updatedByCp {
        _id
        email
        username
      }

      stateChangedUserType
      stateChangedBy {
        _id
        username
        email
      }
      stateChangedByCp {
        _id
        email
        username
      }
    }
  }
`;

export const FORUM_COMMENTS = gql`
  query ForumComments(
    $id: [ID!]
    $limit: Int
    $offset: Int
    $postId: [ID!]
    $replyToId: [ID]
  ) {
    forumComments(
      _id: $id
      limit: $limit
      offset: $offset
      postId: $postId
      replyToId: $replyToId
    ) {
      _id
      content
      createdAt
      postId
      replyToId
      updatedAt

      upVoteCount
      downVoteCount

      createdBy {
        _id
        username
        email
      }
      createdByCp {
        _id
        email
        username
      }
    }
  }
`;
