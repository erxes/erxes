const knowledgeBaseTopics = `
  query objects($page: Int, $perPage: Int) {
    knowledgeBaseTopics(page: $page, perPage: $perPage) {
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
        description
        icon
        articles {
          _id
          title
        }
      }
      createdBy
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const knowledgeBaseTopicsTotalCount = `
  query knowledgeBaseTopicsTotalCount {
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

const knowledgeBaseCategories = `
  query objects($page: Int, $perPage: Int, $topicId: String) {
    knowledgeBaseCategories(page: $page, perPage: $perPage, topicId: $topicId ) {
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

const knowledgeBaseTopicDetail = `
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      brand
    }
  }
`;

const knowledgeBaseCategoryDetail = `
  query knowledgeBaseCategoryDetail($_id: String!) {
    knowledgeBaseCategoryDetail(_id: $_id) {
      _id
      title
      description
      articles {
        _id
        title
        summary
        content
        status
      }
      icon
    }
  }
`;

const knowledgeBaseCategoriesTotalCount = `
  query knowledgeBaseCategoriesTotalCount($topicId: String) {
    knowledgeBaseCategoriesTotalCount(topicId: $topicId)
  }
`;

const categoriesGetLast = `
  query knowledgeBaseCategoriesGetLast {
    knowledgeBaseCategoriesGetLast {
      _id
    }
  }
`;

const knowledgeBaseArticles = `
  query objects($page: Int, $perPage: Int, $categoryId: String) {
    knowledgeBaseArticles(page: $page, perPage: $perPage, categoryId: $categoryId) {
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

const knowledgeBaseArticlesTotalCount = `
  query knowledgeBaseArticlesTotalCount($categoryId: String) {
    knowledgeBaseArticlesTotalCount(categoryId: $categoryId)
  }
`;

export default {
  getBrandList,
  categoriesGetLast,
  knowledgeBaseTopics,
  knowledgeBaseTopicDetail,
  knowledgeBaseTopicsTotalCount,
  knowledgeBaseCategories,
  knowledgeBaseCategoryDetail,
  knowledgeBaseCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseArticlesTotalCount
};
