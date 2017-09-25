const getTopicDetail = `
  query knowledgeBaseTopicsDetail($_id: String!) {
    knowledgeBaseTopicsDetail(_id: $_id) {
      _id
      title
      description
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      brand {
        _id
        name
      }
      categories {
        _id
        title
      }
    }
  }
`;

const getTopicList = `
  query knowledgeBaseTopics($limit: Int) {
    knowledgeBaseTopics(limit: $limit) {
      _id
      title
      description
      brand {
        _id
        name
      }
      categories {
        _id
        title
      }
      createdBy
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const getTopicCount = `
  query totalKnowledgeBaseTopicsCount {
    knowledgeBaseTopicsTotalCount
  }
`;

const getBrandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

const getCategoryList = `
  query knowledgeBaseCategories {
    knowledgeBaseCategories {
      _id
      title
      description
      icon
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      articles {
        _id
        title
      }
    }
  }
`;

const getCategoryDetail = `
  query knowledgeBaseCategoriesDetail($_id: String!) {
    knowledgeBaseCategoriesDetail(_id: $_id) {
      _id
      title
      description
      icon
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      articles {
        _id
        title
      }
    }
  }
`;

const getCategoryCount = `
  query totalKnowledgeBaseCategoriesCount {
    knowledgeBaseCategoriesTotalCount
  }
`;

const getArticleDetail = `
  query knowledgeBaseArticlesDetail($_id: String!) {
    knowledgeBaseArticlesDetail(_id: $_id) {
      _id
      title
      summary
      content
      createdBy
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const getArticleList = `
  query knowledgeBaseArticles {
    knowledgeBaseArticles {
      _id
      title
      summary
      content
      status
      createdBy
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const getArticleCount = `
  query totalKnowledgeBaseArticlesCount {
    knowledgeBaseArticlesTotalCount
  }
`;

export default {
  getBrandList,
  getTopicDetail,
  getTopicList,
  getTopicCount,
  getCategoryDetail,
  getCategoryList,
  getCategoryCount,
  getArticleDetail,
  getArticleList,
  getArticleCount,
};
