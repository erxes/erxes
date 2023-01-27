const allCategoryQueries = [
  'ForumCategoriesByParentIds',
  'ForumCategoryDetail',
  'ForumCategoryPossibleParents',
  'allCategories'
];

const categoriesAll = `
  query allCategories {
    forumCategories {
      _id
      name
      parentId
    }
  }
`;

const categoriesByParentIds = `
  query ForumCategoriesByParentIds($parentId: [ID]) {
    forumCategories(parentId: $parentId) {
      _id
      name
      thumbnail
      code
      postsCount
      postsReqCrmApproval
      parentId
      ancestors {
        _id
      }
    }
  }
`;

const categoryDetail = `
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
      parent {
        _id
        name
      }
    }
  }
`;

const categoryPossibleParents = `
  query ForumCategoryPossibleParents($_id: ID) {
    forumCategoryPossibleParents(_id: $_id) {
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

const postRefetchAfterCreateDelete = ['ForumPostsQuery', 'ForumPostsCount'];

const postRefetchAfterEdit = ['ForumPostsQuery', 'ForumPostDetail'];

const forumPostsQuery = `
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

const forumPostsCount = `
  query ForumPostsCount(${forumPostsParam}) {
    forumPostsCount(${forumPostsArg})
  }
`;

const forumPostDetail = `
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
      stateChangedAt
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

const forumComments = `
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

const permissionGroupsQuery = `
  query ForumPermissionGroups {
    forumPermissionGroups {
      _id
      name
    }
  }
`;
const permissionGroupQuery = `
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
      }
    }
  }
`;

const permissionGroupRefetch = [
  'ForumPermissionGroups',
  'ForumPermissionGroup'
];

const forumSubscriptionProductsQuery = `
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

const pageDetail = `
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

const pageRefetch = ['ForumPages', 'ForumPage'];

export default {
  allCategoryQueries,
  categoriesAll,
  categoriesByParentIds,
  categoryDetail,
  categoryPossibleParents,
  postRefetchAfterCreateDelete,
  postRefetchAfterEdit,
  forumPostsQuery,
  forumPostsCount,
  forumPostDetail,
  forumComments,
  permissionGroupsQuery,
  permissionGroupQuery,
  permissionGroupRefetch,
  forumSubscriptionProductsQuery,
  pageDetail,
  pageRefetch
};
