const kbSearchArticlesQuery = `
  query widgetsKnowledgeBaseArticles($topicId: String!, $searchString: String!) {
    widgetsKnowledgeBaseArticles(topicId: $topicId, searchString: $searchString) {
      _id
      title
      summary
      content
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      createdUser {
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const getKbCategoryQuery = `
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

const getKbTopicQuery = `
  query widgetsKnowledgeBaseTopicDetail($_id: String!) {
    widgetsKnowledgeBaseTopicDetail(_id: $_id) {
      title
      description
      color
      backgroundImage
      languageCode
      categories {
        _id
        title
        description
        icon
        numOfArticles
        authors {
          details {
            fullName
            avatar
          }
        }
      }
    }
  }
`;

const incReactionCount = `
  mutation widgetsKnowledgebaseIncReactionCount($articleId: String! $reactionChoice: String!) {
    widgetsKnowledgebaseIncReactionCount(articleId: $articleId, reactionChoice: $reactionChoice)
  }
`;

export default {
  kbSearchArticlesQuery,
  getKbCategoryQuery,
  incReactionCount,
  getKbTopicQuery
};
