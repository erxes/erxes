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

      parent {
        name
      }
    }
  }
`;

export const CATEGORIES_BY_PARENT_IDS = gql`
  query ForumCategoriesByParentIds($parentId: [ID]) {
    forumCategories(parentId: $parentId, sort: { order: 1 }) {
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
      userLevelReqPostRead
      userLevelReqPostWrite
      userLevelReqCommentWrite
      postsReqCrmApproval
      postReadRequiresPermissionGroup
      postWriteRequiresPermissionGroup
      commentWriteRequiresPermissionGroup
      order
      description
      parent {
        _id
        name
      }
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

const forumPostsParam = `
  $_id: [ID!] 
  $categoryId: [ID!] 
  $categoryIncludeDescendants: Boolean 
  $limit: Int 
  $offset: Int 
  $state: [ForumPostState!]
  $sort: JSON
  $categoryApprovalState: [AdminApprovalState!]
`;

const forumPostsArg = `
  _id: $_id
  categoryId: $categoryId
  categoryIncludeDescendants: $categoryIncludeDescendants
  limit: $limit
  offset: $offset
  state: $state
  sort: $sort
  categoryApprovalState: $categoryApprovalState
`;

export const POST_REFETCH_AFTER_CREATE_DELETE = [
  'ForumPostsQuery',
  'ForumPostsCount'
];

export const POST_REFETCH_AFTER_EDIT = ['ForumPostsQuery', 'ForumPostDetail'];

export const FORUM_POSTS_QUERY = gql`
  query ForumPostsQuery(${forumPostsParam}) {
    forumPosts(${forumPostsArg}) {
      
      _id
      title
      state
      thumbnail
      categoryId
      createdAt
      updatedAt
      commentCount
      categoryApprovalState

      viewCount

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

      lastPublishedAt
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
        postsReqCrmApproval
      }
      categoryId
      content
      state
      thumbnail
      title
      createdAt
      updatedAt
      commentCount

      categoryApprovalState

      description

      viewCount

      upVoteCount
      downVoteCount

      isPollMultiChoice
      pollEndDate

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

      lastPublishedAt

      tagIds

      tags {
        _id
        colorCode
        name
      }

      pollOptions {
        _id
        title
        order
      }

      quizzes {
        _id
        name
      }

      isFeaturedByAdmin
      isFeaturedByUser
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

export const PERMISSION_GROUPS_QUERY = gql`
  query ForumPermissionGroups {
    forumPermissionGroups {
      _id
      name
    }
  }
`;
export const PERMISSION_GROUP_QUERY = gql`
  query ForumPermissionGroup($_id: ID!) {
    forumPermissionGroup(_id: $_id) {
      _id
      name
      users {
        _id
        code
        companyName
        email
        firstName
        lastName
        username
        type
      }
    }
  }
`;

export const PERMISSION_GROUP_REFETCH = [
  'ForumPermissionGroups',
  'ForumPermissionGroup'
];

export const FORUM_SUBSCRIPTION_PRODUCTS_QUERY = gql`
  query ForumSubscriptionProducts($sort: JSON, $userType: String) {
    forumSubscriptionProducts(sort: $sort, userType: $userType) {
      _id
      description
      listOrder
      multiplier
      name
      price
      unit
      userType
    }
  }
`;

export const PAGE_DETAIL = gql`
  query ForumPage($id: ID!) {
    forumPage(_id: $id) {
      _id
      content
      code
      custom
      customIndexed
      description
      listOrder
      thumbnail
      title
    }
  }
`;

export const PAGE_REFETCH = ['ForumPages', 'ForumPage'];
