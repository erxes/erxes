const kbLoaderQuery = `
  query knowledgeBaseLoader($topicId: String!) {
    knowledgeBaseLoader(topicId: $topicId) {
      loadType
    }
  }
`;

const kbSearchArticlesQuery = `
  query knowledgeBaseArticlesSearch($topicId: String!, $searchString: String!) {
    knowledgeBaseArticlesSearch(topicId: $topicId, searchString: $searchString) {
      _id
      title
      summary
      content
      createdBy
      createdDate
      modifiedBy
      modifiedDate
      authorDetails {
        fullName
        avatar
      }
    }
  }
`;

const getKbTopicQuery = `
  query knowledgeBaseTopicsDetail($topicId: String!) {
    knowledgeBaseTopicsDetail(topicId: $topicId) {
      title
      description
      categories {
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
          articleCount
        }
        articles {
          _id
          title
          summary
          content
          createdBy
          createdDate
          modifiedBy
          modifiedDate
          authorDetails {
            fullName
            avatar
          }
        }
      }
    }
  }
`;

export default {
  kbLoaderQuery,
  kbSearchArticlesQuery,
  getKbTopicQuery,
}
