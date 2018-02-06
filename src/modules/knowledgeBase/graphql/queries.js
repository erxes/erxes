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
  query objects($page: Int, $perPage: Int) {
    knowledgeBaseCategories(page: $page, perPage: $perPage) {
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
  query knowledgeBaseCategoriesTotalCount {
    knowledgeBaseCategoriesTotalCount
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
  knowledgeBaseTopicsTotalCount,
  knowledgeBaseCategories,
  knowledgeBaseCategoryDetail,
  knowledgeBaseCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseArticlesTotalCount
};
