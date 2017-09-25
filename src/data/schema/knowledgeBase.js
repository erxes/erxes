const types = `
  KnowledgeBaseTopic {
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

  type KnowledgeBaseArticle {
    _id: String
    title: String
    summary: String
    content: String
    status: String
    createdBy: String
    createdDate: Date
    modifiedBy: String
    modifiedDate: Date
  }
`;

const queries = `
  knowledgeBaseTopics(limit: Int): [KnowledgeBaseTopic]
  knowledgeBaseTopicsDetail(_id: String!): KbTopic
  KnowledgeBaseTopicsTotalCount: Int

  knowledgeBaseCategories(limit: Int): [KnowledgeBaseCategory]
  knowledgeBaseCategoriesDetail(_id: String!): KbCategory
  KnowledgeBaseCategoriesTotalCount: Int

  knowledgeBaseArticles(limit: Int): [KnowledgeBaseArticle]
  knowledgeBaseArticlesDetail(_id: String!): KbArticle
  KnowledgeBaseArticlesTotalCount: Int
`;

export default {
  types,
  queries,
};
