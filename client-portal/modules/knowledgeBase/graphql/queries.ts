const categoryFields = `
  _id
  title
  description
  icon
  numOfArticles
  authors {
    _id
    details {
      fullName
      avatar
    }
  }
`;

export const getKbTopicQuery = `
  query knowledgeBaseTopicDetail($_id: String!) {
    clientPortalKnowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      color
      backgroundImage
      languageCode

      categories {
        ${categoryFields}
      }
      
      parentCategories {
        ${categoryFields}
        childrens {
          ${categoryFields}
        }
        articles{
          _id
          title        
        }
      }
    }
  }
`;

export const categoryDetailQuery = `
  query knowledgeBaseCategoryDetail($_id: String!) {
    knowledgeBaseCategoryDetail(_id: $_id) {
      _id
      title
      description
      numOfArticles
      icon
      authors {
        details {
          fullName
          avatar
        }
      }
      articles {
        _id
        title
        summary
        content
        reactionChoices
        createdBy
        createdDate
        modifiedBy
        modifiedDate
        categoryId
        createdUser {
          details {
            fullName
            avatar
          }
        }
      }
    }
  }
`;

export const articleDetailQuery = `
  query knowledgeBaseArticleDetail($_id: String!) {
    knowledgeBaseArticleDetail(_id: $_id) {
      _id
      title
      viewCount
      summary
      content
      status
      forms {
        brandId
        formId
      }
      reactionChoices
      reactionCounts
      createdBy
      createdUser {
        details {
          fullName
          avatar
        }
      }
      categoryId
      createdDate
      modifiedBy
      modifiedDate
    }
  }
`;

export const articlesQuery = `
  query knowledgeBaseArticles($categoryIds: [String], $searchValue: String, $topicId: String,) {
    clientPortalKnowledgeBaseArticles(categoryIds: $categoryIds, searchValue: $searchValue, topicId: $topicId) {
      _id
      title
      viewCount
      summary
      content
      status
      forms {
        brandId
        formId
      }
      reactionChoices
      reactionCounts
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      categoryId
      createdUser {
        details {
          fullName
          avatar
        }
      }
    }
  }
`;
