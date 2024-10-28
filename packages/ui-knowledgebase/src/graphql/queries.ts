const categoryFields = `
  _id
  title
  description
  icon
  code
`;

const knowledgeBaseTopicsShort = `
  query kbTopics($page: Int, $perPage: Int) {
    knowledgeBaseTopics(page: $page, perPage: $perPage) {
      _id
      title
      brand {
        _id
        name
      }
    }
  }
`;

const knowledgeBaseTopics = `
  query knowledgeBaseTopics($page: Int, $perPage: Int) {
    knowledgeBaseTopics(page: $page, perPage: $perPage) {
      _id
      title
      code
      description
      brand {
        _id
        name
      }
      categories {
        ${categoryFields}
      }
      color
      backgroundImage
      languageCode
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      notificationSegmentId

      parentCategories {
        ${categoryFields}
      }
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

const getSegmentList = `
query segments($contentTypes: [String]!) {
  segments(contentTypes: $contentTypes) {
    _id 
    name
  }
}
`;

const knowledgeBaseCategories = `
  query objects($page: Int, $perPage: Int, $topicIds: [String]) {
    knowledgeBaseCategories(page: $page, perPage: $perPage, topicIds: $topicIds ) {
      ${categoryFields}
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      parentCategoryId
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
      ${categoryFields}
      articles {
        _id
        title
        summary
        content
        status
        isPrivate
      }
      firstTopic {
        _id
        title
      }
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
  query KnowledgeBaseArticles($page: Int, $perPage: Int, $categoryIds: [String]) {
    knowledgeBaseArticles(page: $page, perPage: $perPage, categoryIds: $categoryIds) {
      _id
      code
      title
      summary
      content
      status
      isPrivate
      reactionChoices
      reactionCounts
      createdBy
      topicId
      categoryId
      createdUser {
        _id
        username
        email
        details {
          avatar
          fullName
        }
      }
      attachments {
        name
        url
        type
        size
        duration
      }

      pdfAttachment {
        pdf {
          name
          url
          type
          size
        }
        pages {
          name
          url
          type
          size
        }
      }
      image {
        name
        url
        type
        size
      }
      createdDate
      modifiedBy
      modifiedDate
      scheduledDate

      forms {
        brandId
        formId
      }

      publishedUserId
      publishedUser {
        _id
        username
        email
        details {
          avatar
          fullName
        }
      }
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
  getSegmentList,
  categoriesGetLast,
  knowledgeBaseTopics,
  knowledgeBaseTopicsShort,
  knowledgeBaseTopicsTotalCount,
  knowledgeBaseCategories,
  knowledgeBaseCategoryDetail,
  knowledgeBaseCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseArticlesTotalCount,
};
