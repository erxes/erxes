const forumCreateCategoryParamsCommon = `
  $name: String!
  $code: String
  $thumbnail: String
  $userLevelReqPostRead: String!
  $userLevelReqPostWrite: String!
  $userLevelReqCommentWrite: String!
  $postsReqCrmApproval: Boolean!
  $postReadRequiresPermissionGroup: Boolean
  $postWriteRequiresPermissionGroup: Boolean
  $commentWriteRequiresPermissionGroup: Boolean
  $order: Float
  $description: String
`;

const forumCreateCategoryArgsCommon = `
  name: $name
  code: $code
  thumbnail: $thumbnail
  userLevelReqPostRead: $userLevelReqPostRead
  userLevelReqPostWrite: $userLevelReqPostWrite
  userLevelReqCommentWrite: $userLevelReqCommentWrite
  postsReqCrmApproval: $postsReqCrmApproval
  postReadRequiresPermissionGroup: $postReadRequiresPermissionGroup
  postWriteRequiresPermissionGroup: $postWriteRequiresPermissionGroup
  commentWriteRequiresPermissionGroup: $commentWriteRequiresPermissionGroup
  order: $order
  description: $description
`;

const updateCategory = `
  mutation ForumPatchCategory(
    $_id: ID!
    $parentId: String
    ${forumCreateCategoryParamsCommon}
  ) {
    forumPatchCategory(
      _id: $_id
      parentId: $parentId
      ${forumCreateCategoryArgsCommon}
    ) {
      _id
    }
  }
`;

const createCategory = `
  mutation ForumCreateCategory(
    $parentId: String
    ${forumCreateCategoryParamsCommon}
  ) {
    forumCreateCategory(
      parentId: $parentId
      ${forumCreateCategoryArgsCommon}
    ) {
      _id
    }
  }
`;

const deleteCategory = `
  mutation ForumDeleteCategory($id: ID!) {
    forumDeleteCategory(_id: $id) {
      _id
    }
  }
`;

const createRootCategory = `
  mutation ForumCreateRootCategory(
    ${forumCreateCategoryParamsCommon}
  ) {
    forumCreateCategory(
      ${forumCreateCategoryArgsCommon}
      ) {
      _id
    }
  }
`;

const createComment = `
  mutation ForumCreateComment($content: String!, $replyToId: ID, $postId: ID!) {
    forumCreateComment(
      content: $content
      replyToId: $replyToId
      postId: $postId
    ) {
      _id
    }
  }
`;

const deleteComment = `
  mutation ForumDeleteComment($_id: ID!) {
    forumDeleteComment(_id: $_id) {
      _id
    }
  }
`;

const createPost = `
  mutation ForumCreatePost(
    $categoryId: ID!
    $content: String!
    $description: String
    $title: String!
    $thumbnail: String
    $thumbnailAlt: String
    $pollEndDate: Date
    $pollOptions: [ForumPollOptionInput!]
    $isPollMultiChoice: Boolean
    $createdAt: Date
    $tagIds: [ID!]
    $createdById: String
  ) {
    forumCreatePost(
      categoryId: $categoryId
      content: $content
      description: $description
      title: $title
      thumbnail: $thumbnail
      thumbnailAlt: $thumbnailAlt
      pollEndDate: $pollEndDate
      pollOptions: $pollOptions
      isPollMultiChoice: $isPollMultiChoice
      createdAt: $createdAt
      tagIds: $tagIds
      createdById: $createdById
    ) {
      _id
    }
  }
`;

const editPost = `
  mutation ForumPatchPost(
    $_id: ID!
    $categoryId: ID!
    $content: String
    $description: String
    $thumbnail: String
    $thumbnailAlt: String
    $title: String
    $tagIds: [ID!]
    $pollEndDate: Date
    $pollOptions: [ForumPollOptionInput!]
    $isPollMultiChoice: Boolean
    $createdAt: Date
    $createdById : String
  ) {
    forumPatchPost(
      _id: $_id
      categoryId: $categoryId
      content: $content
      description: $description
      thumbnail: $thumbnail
      thumbnailAlt: $thumbnailAlt
      title: $title
      tagIds: $tagIds
      pollEndDate: $pollEndDate
      pollOptions: $pollOptions
      isPollMultiChoice: $isPollMultiChoice
      createdAt: $createdAt
      createdById: $createdById
    ) {
      _id
    }
  }
`;

const editPage = `
mutation ForumPatchPage(
  $_id: ID!
  $code: String
  $content: String
  $custom: JSON
  $customIndexed: JSON
  $description: String
  $listOrder: Float
  $thumbnail: String
  $title: String
) {
  forumPatchPage(
    _id: $_id
    code: $code
    content: $content
    custom: $custom
    customIndexed: $customIndexed
    description: $description
    listOrder: $listOrder
    thumbnail: $thumbnail
    title: $title
  ) {
    _id
  }
}
`;

const createPage = `
mutation ForumCreatePage(
  $code: String
  $content: String
  $custom: JSON
  $customIndexed: JSON
  $description: String
  $listOrder: Float
  $thumbnail: String
  $title: String
) {
  forumCreatePage(
    code: $code
    content: $content
    custom: $custom
    customIndexed: $customIndexed
    description: $description
    listOrder: $listOrder
    thumbnail: $thumbnail
    title: $title
  ) {
    _id
  }
}
`;

const deletePost = `
mutation ForumDeletePost($_id: ID!) {
  forumDeletePost(_id: $_id) {
    _id
  }
}
`;

const deletePage = `
mutation ForumDeletePage($_id: ID!) {
  forumDeletePage(_id: $_id) {
    _id
  }
}
`;

const postDraft = `
mutation ForumPostDraft($_id: ID!) {
  forumPostDraft(_id: $_id) {
    _id
  }
}
`;

const postPublish = `
mutation ForumPostDraft($_id: ID!) {
  forumPostPublish(_id: $_id) {
    _id
  }
}
`;

const postApprove = `
mutation ForumPostApprove($_id: ID!) {
  forumPostApprove(_id: $_id) {
    _id
  }
}
`;

const postDeny = `
mutation ForumPostDeny($_id: ID!) {
  forumPostDeny(_id: $_id) {
    _id
  }
}
`;

const addPermit = `
mutation ForumPermissionGroupAddCategoryPermit(
  $_id: ID!
  $categoryIds: [ID!]!
  $permission: ForumPermission!
) {
  forumPermissionGroupAddCategoryPermit(
    _id: $_id
    categoryIds: $categoryIds
    permission: $permission
  )
}
`;

const removePermit = `
mutation ForumPermissionGroupRemoveCategoryPermit(
  $_id: ID!
  $categoryIds: [ID!]!
  $permission: ForumPermission!
) {
  forumPermissionGroupRemoveCategoryPermit(
    _id: $_id
    categoryIds: $categoryIds
    permission: $permission
  )
}
`;

const permissionGroupCreate = `
mutation ForumPermissionGroupCreate($name: String!) {
  forumPermissionGroupCreate(name: $name) {
    _id
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

const permissionGroupPatch = `
mutation ForumPermissionGroupPatch($_id: ID!, $name: String) {
  forumPermissionGroupPatch(_id: $_id, name: $name) {
    _id
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

const permissionGroupDelete = `
mutation ForumPermissionGroupDelete($_id: ID!) {
  forumPermissionGroupDelete(_id: $_id) {
    _id
  }
}
`;

const permissionUserRemove = `
mutation ForumPermissionGroupRemoveUser($_id: ID!, $cpUserId: ID!) {
  forumPermissionGroupRemoveUser(_id: $_id, cpUserId: $cpUserId)
}
`;

const permissionGroupAddUsers = `
  mutation ForumPermissionGroupAddUsers($_id: ID!, $cpUserIds: [ID!]!) {
    forumPermissionGroupAddUsers(_id: $_id, cpUserIds: $cpUserIds)
  }
`;

const permissionGroupSetUsers = `
  mutation ForumPermissionGroupSetUsers($_id: ID!, $cpUserIds: [ID!]!) {
    forumPermissionGroupSetUsers(_id: $_id, cpUserIds: $cpUserIds)
  }
`;

const deleteSubscriptionProduct = `
mutation ForumDeleteSubscriptionProduct($_id: ID!) {
  forumDeleteSubscriptionProduct(_id: $_id) {
    _id
  }
}
`;

const createProduct = `
mutation ForumCreateSubscriptionProduct(
  $multiplier: Float!
  $price: Float!
  $unit: ForumTimeDurationUnit!
  $description: String
  $listOrder: Float
  $name: String
  $userType: String
) {
  forumCreateSubscriptionProduct(
    multiplier: $multiplier
    price: $price
    unit: $unit
    description: $description
    listOrder: $listOrder
    name: $name
    userType: $userType
  ) {
    _id
  }
}
`;

const updateProduct = `
mutation ForumPatchSubscriptionProduct(
  $_id: ID!
  $description: String
  $listOrder: Float
  $multiplier: Float
  $name: String
  $price: Float
  $unit: ForumTimeDurationUnit
  $userType: String
) {
  forumPatchSubscriptionProduct(
    _id: $_id
    description: $description
    listOrder: $listOrder
    multiplier: $multiplier
    name: $name
    price: $price
    unit: $unit
    userType: $userType
  ) {
    _id
  }
}
`;

const extendSubscription = `
mutation ForumManuallyExtendSubscription(
  $cpUserId: ID!
  $multiplier: Float!
  $price: Float!
  $unit: ForumTimeDurationUnit!
  $userType: ForumCpUserType!
) {
  forumManuallyExtendSubscription(
    cpUserId: $cpUserId
    multiplier: $multiplier
    price: $price
    unit: $unit
    userType: $userType
  ) {
    _id
  }
}
`;

const deleteQuiz = `
mutation ForumQuizDelete($id: ID!) {
  forumQuizDelete(_id: $id) {
    _id
  }
}
`;

const createQuiz = `
mutation ForumQuizCreate(
  $categoryId: ID
  $companyId: ID
  $description: String
  $name: String
  $postId: ID
  $tagIds: [ID!]
) {
  forumQuizCreate(
    categoryId: $categoryId
    companyId: $companyId
    description: $description
    name: $name
    postId: $postId
    tagIds: $tagIds
  ) {
    _id
  }
}
`;

const updateQuiz = `
mutation ForumQuizPatch(
  $_id: ID!
  $categoryId: ID
  $companyId: ID
  $description: String
  $name: String
  $postId: ID
  $tagIds: [ID!]
) {
  forumQuizPatch(
    _id: $_id
    categoryId: $categoryId
    companyId: $companyId
    description: $description
    name: $name
    postId: $postId
    tagIds: $tagIds
  ) {
    _id
  }
}
`;

const createQuizQuestion = `
mutation ForumQuizQuestionCreate(
  $isMultipleChoice: Boolean!
  $listOrder: Float!
  $quizId: ID!
  $imageUrl: String
  $text: String
) {
  forumQuizQuestionCreate(
    isMultipleChoice: $isMultipleChoice
    listOrder: $listOrder
    quizId: $quizId
    imageUrl: $imageUrl
    text: $text
  ) {
    _id
  }
}
`;

const setQuizState = `
mutation ForumQuizSetState($_id: ID!, $state: ForumQuizState!) {
  forumQuizSetState(_id: $_id, state: $state)
}
`;

const quizChoicePatch = `
mutation ForumQuizChoicePatch(
  $_id: ID!
  $imageUrl: String
  $isCorrect: Boolean
  $listOrder: Float
  $text: String
) {
  forumQuizChoicePatch(
    _id: $_id
    imageUrl: $imageUrl
    isCorrect: $isCorrect
    listOrder: $listOrder
    text: $text
  ) {
    _id
  }
}
`;

const quizChoiceDelete = `
mutation ForumQuizChoiceDelete($_id: ID!) {
  forumQuizChoiceDelete(_id: $_id) {
    _id
  }
}
`;

const quizQuestionPatch = `
mutation ForumQuizQuestionPatch(
  $_id: ID!
  $imageUrl: String
  $isMultipleChoice: Boolean
  $listOrder: Float
  $text: String
) {
  forumQuizQuestionPatch(
    _id: $_id
    imageUrl: $imageUrl
    isMultipleChoice: $isMultipleChoice
    listOrder: $listOrder
    text: $text
  ) {
    _id
  }
}
`;

const createChoice = `
mutation ForumQuizChoiceCreate(
  $isCorrect: Boolean!
  $listOrder: Float!
  $questionId: ID!
  $quizId: ID!
  $imageUrl: String
  $text: String
) {
  forumQuizChoiceCreate(
    isCorrect: $isCorrect
    listOrder: $listOrder
    questionId: $questionId
    quizId: $quizId
    imageUrl: $imageUrl
    text: $text
  ) {
    _id
  }
}
`;

const deleteQuizQuestion = `
mutation ForumQuizQuestionDelete($_id: ID!) {
  forumQuizQuestionDelete(_id: $_id) {
    _id
  }
}
`;

const featuredToggle = `
  mutation ForumPostSetFeatured($id: ID!, $featured: Boolean!) {
    forumPostSetFeatured(_id: $id, featured: $featured)
  }
`;

export default {
  updateCategory,
  createCategory,
  deleteCategory,
  createRootCategory,
  createComment,
  deleteComment,
  createPost,
  editPost,
  editPage,
  createPage,
  deletePost,
  deletePage,
  postDraft,
  postPublish,
  postApprove,
  postDeny,
  addPermit,
  removePermit,
  permissionGroupCreate,
  permissionGroupPatch,
  permissionGroupDelete,
  permissionUserRemove,
  permissionGroupAddUsers,
  permissionGroupSetUsers,
  deleteSubscriptionProduct,
  updateProduct,
  createProduct,
  extendSubscription,
  deleteQuiz,
  createQuiz,
  updateQuiz,
  createQuizQuestion,
  setQuizState,
  quizChoicePatch,
  quizChoiceDelete,
  quizQuestionPatch,
  createChoice,
  deleteQuizQuestion,
  featuredToggle
};
