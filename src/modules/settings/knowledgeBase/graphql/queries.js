export const knowledgeBaseTopics = `
  query knowledgeBaseTopics($limit: Int!) {
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

export const knowledgeBaseCategoriesTotalCount = `
  query knowledgeBaseCategoriesTotalCount {
    knowledgeBaseCategoriesTotalCount
  }
`;

export const knowledgeBaseArticles = `
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
