const kbLoaderQuery = `
  query knowledgeBaseLoader($topicId: String!) {
    knowledgeBaseLoader(topicId: $topicId) {
      loadType
    }
  }
`;

const kbSearchArticlesQuery = `
  query knowledgeBaseArticles($topicId: String!, $searchString: String!) {
    knowledgeBaseArticles(topicId: $topicId, searchString: $searchString) {
      _id
      title
      summary
      content
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      author {
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

const getKbCategoryQuery = `
  query knowledgeBaseCategoriesDetail($categoryId: String!) {
    knowledgeBaseCategoriesDetail(categoryId: $categoryId) {
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
        author {
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
  query knowledgeBaseTopicsDetail($topicId: String!) {
    knowledgeBaseTopicsDetail(topicId: $topicId) {
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
  mutation knowledgebaseIncReactionCount($articleId: String! $reactionChoice: String!) {
    knowledgebaseIncReactionCount(articleId: $articleId, reactionChoice: $reactionChoice)
  }
`;

export default {
  kbLoaderQuery,
  kbSearchArticlesQuery,
  getKbCategoryQuery,
  incReactionCount,
  getKbTopicQuery
};
