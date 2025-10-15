export const types = `
  type FormCode {
    brandId: String
    formId: String
  }

type KnowledgeBaseArticle @key(fields: "_id") {
    _id: String!
    code: String
    title: String
    summary: String
    content: String
    status: String
    isPrivate: Boolean
    reactionChoices: [String]
    reactionCounts: JSON
    createdBy: String
    createdUser: User
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    topicId: String
    categoryId: String
    viewCount: Int
    attachments: [Attachment]
    image: Attachment
    pdfAttachment: PdfAttachment
    publishedUserId:String
    publishedUser:User
    publishedAt: Date
    scheduledDate: Date

    forms: [FormCode]
  }


type KnowledgeBaseCategory {
    _id: String!
    code: String
    title: String
    description: String
    articles(status: String): [KnowledgeBaseArticle]
    icon: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    parentCategoryId: String

    firstTopic: KnowledgeBaseTopic
    authors: [User]
    numOfArticles(status: String): Float
    countArticles:Int
  }

type KnowledgeBaseParentCategory {
    _id: String!
    code: String
    title: String
    description: String
    articles: [KnowledgeBaseArticle]
    icon: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    parentCategoryId: String

    firstTopic: KnowledgeBaseTopic
    authors: [User]
    numOfArticles(status: String): Float

    children: [KnowledgeBaseCategory]
  }

type KnowledgeBaseTopic @key(fields: "_id") {
    _id: String!
    code: String
    title: String
    description: String
    categories: [KnowledgeBaseCategory]
    brandId: String
    brand: Brand
    color: String
    backgroundImage: String
    languageCode: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    parentCategories: [KnowledgeBaseParentCategory]
    notificationSegmentId: String
  }

type KnowledgeBaseLoader {
    loadType: String
  }

  type KnowledgeBaseTopicsListResponse {
    list: [KnowledgeBaseTopic],
    pageInfo: PageInfo
    totalCount: Int,
  }

  type KnowledgeBaseCategoriesListResponse {
    list: [KnowledgeBaseCategory],
    pageInfo: PageInfo
    totalCount: Int,
  }

  type KnowledgeBaseArticlesListResponse {
    list: [KnowledgeBaseArticle],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

export const inputs = `
  input FormCodeInput {
    brandId: String
    formId: String
  }

input KnowledgeBaseArticleInput {
    code: String
    title: String!
    summary: String
    content: String!
    status: String!
    isPrivate: Boolean
    reactionChoices: [String]
    categoryIds: [String]
    topicId: String
    categoryId: String
    image: AttachmentInput
    attachments: [AttachmentInput]
    pdfAttachment: PdfAttachmentInput
    scheduledDate: Date
    forms: [FormCodeInput]
  }

input KnowledgeBaseCategoryInput {
    code: String
    title: String!
    description: String
    articleIds: [String]
    icon: String!
    topicIds: [String],
    topicId: String,
    parentCategoryId: String
  }

input KnowledgeBaseTopicInput {
    code: String
    title: String!
    description: String
    categoryIds: [String]
    brandId: String!
    color: String
    backgroundImage: String
    languageCode: String
    notificationSegmentId: String
  }
`;

const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
`;

export const queries = `
  knowledgeBaseTopics(${cursorParams}, brandId: String, codes: [String], language: String): KnowledgeBaseTopicsListResponse
  knowledgeBaseTopicDetail(_id: String!, language: String): KnowledgeBaseTopic
  knowledgeBaseTopicsTotalCount: Int

  knowledgeBaseCategories(${cursorParams},ids:[String] topicIds: [String], codes: [String],icon:String, language: String): KnowledgeBaseCategoriesListResponse
  knowledgeBaseCategoryDetail(_id: String!, language: String): KnowledgeBaseCategory
  knowledgeBaseCategoriesTotalCount(topicIds: [String], codes: [String]): Int
  knowledgeBaseCategoriesGetLast: KnowledgeBaseCategory

  knowledgeBaseArticles(searchValue: String, ${cursorParams}, categoryIds: [String],articleIds:[String], codes: [String], topicIds: [String], sortField:String, sortDirection: Int, status: String, language: String): KnowledgeBaseArticlesListResponse
  knowledgeBaseArticleDetail(_id: String!, language: String): KnowledgeBaseArticle
  knowledgeBaseArticleDetailAndIncViewCount(_id: String!, language: String): KnowledgeBaseArticle
  knowledgeBaseArticlesTotalCount(categoryIds: [String], codes: [String], articleIds:[String], topicIds: [String], status: String, language: String): Int
`;

export const mutations = `
  knowledgeBaseTopicsAdd(input: KnowledgeBaseTopicInput!): KnowledgeBaseTopic
  knowledgeBaseTopicsEdit(_id: String!, input: KnowledgeBaseTopicInput!): KnowledgeBaseTopic
  knowledgeBaseTopicsRemove(_id: String!): JSON

  knowledgeBaseCategoriesAdd(input: KnowledgeBaseCategoryInput!): KnowledgeBaseCategory
  knowledgeBaseCategoriesEdit(_id: String!, input: KnowledgeBaseCategoryInput!): KnowledgeBaseCategory
  knowledgeBaseCategoriesRemove(_id: String!): JSON

  knowledgeBaseArticlesAdd(input: KnowledgeBaseArticleInput!): KnowledgeBaseArticle
  knowledgeBaseArticlesEdit(_id: String!, input: KnowledgeBaseArticleInput!): KnowledgeBaseArticle
  knowledgeBaseArticlesRemove(_id: String!): JSON
  knowledgeBaseArticlesIncrementViewCount(_id: String!): JSON
`;
