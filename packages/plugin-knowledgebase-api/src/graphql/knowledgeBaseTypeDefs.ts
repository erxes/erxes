import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = `
  ${attachmentType}
  ${attachmentInput}
  
  extend type Brand @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
        _id: String! @external
      }

  type FormCode {
    brandId: String
    formId: String
  }

  input FormCodeInput {
    brandId: String
    formId: String
  }

  type KnowledgeBaseArticle @key(fields: "_id") {
    _id: String!
    title: String
    summary: String
    content: String
    status: String
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

    forms: [FormCode]
  }

  input KnowledgeBaseArticleDoc {
    title: String!
    summary: String
    content: String!
    status: String!
    reactionChoices: [String]
    categoryIds: [String]
    topicId: String
    categoryId: String
    image: AttachmentInput
    attachments: [AttachmentInput]

    forms: [FormCodeInput]
  }

  type KnowledgeBaseCategory {
    _id: String
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
    numOfArticles: Float
  }

  type KnowledgeBaseParentCategory {
    _id: String
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
    numOfArticles: Float

    childrens: [KnowledgeBaseCategory]
  }

  input KnowledgeBaseCategoryDoc {
    title: String!
    description: String
    articleIds: [String]
    icon: String!
    topicIds: [String],
    topicId: String,
    parentCategoryId: String
  }

  type KnowledgeBaseTopic @key(fields: "_id") {
    _id: String!
    title: String
    description: String
    categories: [KnowledgeBaseCategory]
    brand: Brand
    color: String
    backgroundImage: String
    languageCode: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
    parentCategories: [KnowledgeBaseParentCategory]
  }
  

  input KnowledgeBaseTopicDoc {
    title: String!
    description: String
    categoryIds: [String]
    brandId: String!
    color: String
    backgroundImage: String
    languageCode: String
  }

  type KnowledgeBaseLoader {
    loadType: String
  }
`;

export const queries = `
  knowledgeBaseTopics(page: Int, perPage: Int, brandId: String): [KnowledgeBaseTopic]
  knowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
  knowledgeBaseTopicsTotalCount: Int

  knowledgeBaseCategories(page: Int, perPage: Int, topicIds: [String]): [KnowledgeBaseCategory]
  knowledgeBaseCategoryDetail(_id: String!): KnowledgeBaseCategory
  knowledgeBaseCategoriesTotalCount(topicIds: [String]): Int
  knowledgeBaseCategoriesGetLast: KnowledgeBaseCategory

  knowledgeBaseArticles(searchValue: String, page: Int, perPage: Int, categoryIds: [String]): [KnowledgeBaseArticle]
  knowledgeBaseArticleDetail(_id: String!): KnowledgeBaseArticle
  knowledgeBaseArticleDetailAndIncViewCount(_id: String!): KnowledgeBaseArticle
  knowledgeBaseArticlesTotalCount(categoryIds: [String]): Int
`;

export const mutations = `
  knowledgeBaseTopicsAdd(doc: KnowledgeBaseTopicDoc!): KnowledgeBaseTopic
  knowledgeBaseTopicsEdit(_id: String!, doc: KnowledgeBaseTopicDoc!): KnowledgeBaseTopic
  knowledgeBaseTopicsRemove(_id: String!): JSON

  knowledgeBaseCategoriesAdd(doc: KnowledgeBaseCategoryDoc!): KnowledgeBaseCategory
  knowledgeBaseCategoriesEdit(_id: String!, doc: KnowledgeBaseCategoryDoc!): KnowledgeBaseCategory
  knowledgeBaseCategoriesRemove(_id: String!): JSON

  knowledgeBaseArticlesAdd(doc: KnowledgeBaseArticleDoc!): KnowledgeBaseArticle
  knowledgeBaseArticlesEdit(_id: String!, doc: KnowledgeBaseArticleDoc!): KnowledgeBaseArticle
  knowledgeBaseArticlesRemove(_id: String!): JSON
`;
