export const types = `
  extend type Brand @key(fields: "_id") {
    _id: String @external
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

    input KnowledgeBaseArticleDoc {
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

    type KnowledgeBaseCategory {
      _id: String
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
      _id: String
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

      childrens: [KnowledgeBaseCategory]
    }

    input KnowledgeBaseCategoryDoc {
      code: String
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
      clientPortalId: String!
      code: String
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
      notificationSegmentId: String
    }

    input KnowledgeBaseTopicDoc {
      clientPortalId:String
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

    type KnowledgeBaseLoader {
      loadType: String
    }
  `;

export const queries = `
    knowledgeBaseTopics(page: Int, perPage: Int, brandId: String, codes: [String], searchValue: String): [KnowledgeBaseTopic]
    knowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
    knowledgeBaseTopicsTotalCount: Int

    cpKnowlegdeBaseTopics(page: Int, perPage: Int, brandId: String, codes: [String], searchValue: String): [KnowledgeBaseTopic]
    cpKnowledgeBaseTopicDetail(_id: String!): KnowledgeBaseTopic
    cpKnowledgeBaseTopicsTotalCount(brandId: String, codes: [String], searchValue: String): Int

    knowledgeBaseCategories(page: Int, perPage: Int, ids:[String], topicIds: [String], codes: [String],icon:String): [KnowledgeBaseCategory]
    knowledgeBaseCategoryDetail(_id: String!): KnowledgeBaseCategory
    knowledgeBaseCategoriesTotalCount(topicIds: [String], codes: [String]): Int
    knowledgeBaseCategoriesGetLast: KnowledgeBaseCategory

    cpKnowledgeBaseCategories(page: Int, perPage: Int, ids:[String], topicIds: [String], codes: [String],icon:String): [KnowledgeBaseCategory]
    cpKnowledgeBaseCategoryDetail(_id: String!): KnowledgeBaseCategory
    cpKnowledgeBaseCategoriesTotalCount(topicIds: [String], codes: [String]): Int
    cpKnowledgeBaseCategoriesGetLast: KnowledgeBaseCategory

    knowledgeBaseArticles(searchValue: String, page: Int, perPage: Int, categoryIds: [String],articleIds:[String], codes: [String], topicIds: [String], sortField:String, sortDirection: Int, status: String): [KnowledgeBaseArticle]
    knowledgeBaseArticleDetail(_id: String!): KnowledgeBaseArticle
    knowledgeBaseArticleDetailAndIncViewCount(_id: String!): KnowledgeBaseArticle
    knowledgeBaseArticlesTotalCount(categoryIds: [String], codes: [String], articleIds:[String], topicIds: [String], status: String): Int

    cpKnowledgeBaseArticles(searchValue: String, page: Int, perPage: Int, categoryIds: [String],articleIds:[String], codes: [String], topicIds: [String], sortField:String, sortDirection: Int, status: String): [KnowledgeBaseArticle]
    cpKnowledgeBaseArticleDetail(_id: String!): KnowledgeBaseArticle
    cpKnowledgeBaseArticleDetailAndIncViewCount(_id: String!): KnowledgeBaseArticle
    cpKnowledgeBaseArticlesTotalCount(categoryIds: [String], codes: [String], articleIds:[String], topicIds: [String], status: String): Int
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
    knowledgeBaseArticlesIncrementViewCount(_id: String!): JSON
  `;
