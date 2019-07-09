const knowledgeBaseTopics = `
  query knowledgeBaseTopics($page: Int, $perPage: Int) {
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
      }
      color
      backgroundImage
      languageCode
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
  query objects($page: Int, $perPage: Int, $topicIds: [String]) {
    knowledgeBaseCategories(page: $page, perPage: $perPage, topicIds: $topicIds ) {
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
      firstTopic {
        _id
        title
      }
      icon
    }
  }
`;

const knowledgeBaseCategoriesTotalCount = `
  query knowledgeBaseCategoriesTotalCount($topicIds: [String]) {
    knowledgeBaseCategoriesTotalCount(topicIds: $topicIds)
  }
`;

const categoriesGetLast = `
  query knowledgeBaseCategoriesGetLast {
    knowledgeBaseCategoriesGetLast {
      _id
      firstTopic {
        _id
        title
      }
    }
  }
`;

const knowledgeBaseArticles = `
  query objects($page: Int, $perPage: Int, $categoryIds: [String]) {
    knowledgeBaseArticles(page: $page, perPage: $perPage, categoryIds: $categoryIds) {
      _id
      title
      summary
      content
      status
      createdBy
      createdUser {
        _id
        username
        email
        details {
          avatar
          fullName
        }
      }
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

const knowledgeBaseArticlesTotalCount = `
  query knowledgeBaseArticlesTotalCount($categoryIds: [String]) {
    knowledgeBaseArticlesTotalCount(categoryIds: $categoryIds)
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
