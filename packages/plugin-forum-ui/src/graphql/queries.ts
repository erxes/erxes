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

      parent {
        _id
        name
      }
    }
  }
`;

const categoriesByParentIds = `
  query ForumCategoriesByParentIds($parentId: [ID]) {
    forumCategories(parentId: $parentId, sort: { order: 1 }) {
      _id
      name
      thumbnail
      code
      order
      description
      postsCount
      userLevelReqPostRead
      userLevelReqPostWrite
      userLevelReqCommentWrite
      postsReqCrmApproval
      postReadRequiresPermissionGroup
      postWriteRequiresPermissionGroup
      commentWriteRequiresPermissionGroup
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
      order
      description
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
      description
      title
      state
      thumbnail
      thumbnailAlt
      categoryId
      createdAt
      updatedAt
      commentCount
      categoryApprovalState
      tagIds
      pollOptions {
        _id
        title
        order
      }
      isPollMultiChoice
      pollEndDate

      viewCount

      upVoteCount
      downVoteCount

      createdUserType
      createdById
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
      description
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

      createdById
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

      isFeaturedByAdmin
      isFeaturedByUser
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
        details {
          avatar
          fullName
        }
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
      users {
        _id
        email
        username
        lastName
        firstName
        code
        companyName
      }
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
        type
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

const pages = `
query ForumPages(
    $sort: JSON
    $limit: Int 
    $offset: Int 
  ) {
  forumPages(
    sort: $sort
    limit: $limit
    offset: $offset
  ) {
    _id
    code
    content
    custom
    customIndexed
    description
    listOrder
    thumbnail
    title
  }
}
`;

const permits = `
  query ForumPermissionGroupCategoryPermits(
    $permissionGroupId: [ID!]
    $permission: [ForumPermission!]
    $categoryId: [ID!]
  ) {
    forumPermissionGroupCategoryPermits(
      permissionGroupId: $permissionGroupId
      permission: $permission
      categoryId: $categoryId
    ) {
      _id
      categoryId
      permissionGroupId
      permission
      permissionGroup {
        name
      }
      category {
        _id
        name
      }
    }
  }
`;

const clientPortalUsers = `
query ClientPortalUsers($ids: [String], $searchValue: String) {
  clientPortalUsers(ids: $ids, excludeIds: true, searchValue: $searchValue) {
    _id
    code
    companyName
    company {
      _id
      avatar
      businessType
      code
    }
    firstName
    email
    lastName
    phone
    username
  }
}
`;

const categoryList = `
query ForumCategories($not__id: [ID!]) {
  forumCategories(not__id: $not__id) {
    _id
    name
  }
}
`;

const clientPortalUserDetail = `
query ClientPortalUserDetail($id: String!) {
  clientPortalUserDetail(_id: $id) {
    _id
    email
    username
    type
    forumSubscriptionEndsAfter
  }
}
`;

const tags = `
query Tags {
  tags(type: "forum:post") {
    _id
    colorCode
    name
  }
}
`;

const quizzesList = `
query ForumQuizzes($limit: Int, $offset: Int, $sort: JSON) {
  forumQuizzes(limit: $limit, offset: $offset, sort: $sort) {
    tagIds
    _id
    name
    description
    state
    company {
      _id
      primaryName
    }
    post {
      _id
      title
    }
    category {
      _id
      name
      parent {
        _id
        name
      }
    }
  }
}
`;

const quizDetail = `
query ForumQuiz($_id: ID!) {
  forumQuiz(_id: $_id) {
    _id
    postId
    companyId
    tagIds
    categoryId
    name
    description
    isLocked
    category {
      _id
      name
    }
    company {
      _id
      primaryEmail
      primaryName
      primaryPhone
    }
    post {
      _id
      title
    }
    questions {
      _id
    }
    state
    tags {
      _id
      name
    }
  }
}
`;

const quizQuestion = `
query ForumQuizQuestion($_id: ID!) {
  forumQuizQuestion(_id: $_id) {
    _id
    choices {
      _id
      imageUrl
      isCorrect
      listOrder
      questionId
      quizId
      text
    }
    imageUrl
    isMultipleChoice
    listOrder
    quizId
    text
  }
}
`;

const companiesList = `
query Companies($page: Int, $perPage: Int, $searchValue: String) {
  companies(page: $page, perPage: $perPage, searchValue: $searchValue) {
    _id
    primaryEmail
    primaryName
    primaryPhone
  }
}
`;

export default {
  allCategoryQueries,
  categoriesAll,
  categoriesByParentIds,
  categoryDetail,
  categoryPossibleParents,
  categoryList,
  postRefetchAfterCreateDelete,
  postRefetchAfterEdit,
  forumPostsQuery,
  forumPostsCount,
  forumPostDetail,
  forumComments,
  permits,
  permissionGroupsQuery,
  permissionGroupQuery,
  permissionGroupRefetch,
  forumSubscriptionProductsQuery,
  pageDetail,
  pageRefetch,
  pages,
  clientPortalUsers,
  clientPortalUserDetail,
  tags,
  quizzesList,
  quizDetail,
  quizQuestion,
  companiesList
};
