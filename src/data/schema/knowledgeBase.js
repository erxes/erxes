export const types = `
  type KnowledgeBaseArticle {
    _id: String
    title: String
    summary: String
    content: String
    status: String
    createdBy: String
    createdUser: User
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
  }

  input KnowledgeBaseArticleDoc {
    title: String!
    summary: String
    content: String!
    status: String!
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
  }

  input KnowledgeBaseCategoryDoc {
    title: String!
    description: String
    articleIds: [String]
    icon: String!
  }

  type KnowledgeBaseTopic {
    _id: String
    title: String
    description: String
    categories: [KnowledgeBaseCategory]
    brand: Brand
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
  }

  input KnowledgeBaseTopicDoc {
    title: String!
    description: String
    categoryIds: [String]
    brandId: String!
  }
`;

export const queries = `
  knowledgeBaseTopics(page: Int, perPage: Int): [KnowledgeBaseTopic]
  knowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
  knowledgeBaseTopicsTotalCount: Int

  knowledgeBaseCategories(page: Int, perPage: Int, topicId: String): [KnowledgeBaseCategory]
  knowledgeBaseCategoryDetail(_id: String!): KnowledgeBaseCategory
  knowledgeBaseCategoriesTotalCount(topicId: String): Int
  knowledgeBaseCategoriesGetLast: KnowledgeBaseCategory

  knowledgeBaseArticles(page: Int, perPage: Int, categoryId: String): [KnowledgeBaseArticle]
  knowledgeBaseArticleDetail(_id: String!): KnowledgeBaseArticle
  knowledgeBaseArticlesTotalCount(categoryId: String): Int
`;

export const mutations = `
  knowledgeBaseTopicsAdd(doc: KnowledgeBaseTopicDoc!): KnowledgeBaseTopic
  knowledgeBaseTopicsEdit(_id: String!, doc: KnowledgeBaseTopicDoc!): KnowledgeBaseTopic
  knowledgeBaseTopicsRemove(_id: String!): Boolean

  knowledgeBaseCategoriesAdd(doc: KnowledgeBaseCategoryDoc!): KnowledgeBaseCategory
  knowledgeBaseCategoriesEdit(_id: String!, doc: KnowledgeBaseCategoryDoc!): KnowledgeBaseCategory
  knowledgeBaseCategoriesRemove(_id: String!): Boolean

  knowledgeBaseArticlesAdd(doc: KnowledgeBaseArticleDoc!): KnowledgeBaseArticle
  knowledgeBaseArticlesEdit(_id: String!, doc: KnowledgeBaseArticleDoc!): KnowledgeBaseArticle
  knowledgeBaseArticlesRemove(_id: String!): Boolean
`;
