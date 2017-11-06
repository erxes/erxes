export const knowledgeBaseTopics = `
  query knowledgeBaseTopics($params: JSON) {
    knowledgeBaseTopics(params: $params) {
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

export const knowledgeBaseTopicsTotalCount = `
  query knowledgeBaseTopicsTotalCount {
    knowledgeBaseTopicsTotalCount
  }
`;

export const getBrandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

export const knowledgeBaseCategories = `
  query knowledgeBaseCategories($params: JSON) {
    knowledgeBaseCategories(params: $params) {
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

export const knowledgeBaseCategoriesTotalCount = `
  query knowledgeBaseCategoriesTotalCount {
    knowledgeBaseCategoriesTotalCount
  }
`;

export const knowledgeBaseArticles = `
  query knowledgeBaseArticles($params: JSON) {
    knowledgeBaseArticles(params: $params) {
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

export const knowledgeBaseArticlesTotalCount = `
  query knowledgeBaseArticlesTotalCount {
    knowledgeBaseArticlesTotalCount
  }
`;

export default {
  getBrandList,
  knowledgeBaseTopics,
  knowledgeBaseTopicsTotalCount,
  knowledgeBaseCategories,
  knowledgeBaseCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseArticlesTotalCount
};
