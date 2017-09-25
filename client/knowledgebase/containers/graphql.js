const kbLoaderQuery = `
  query kbLoader($topicId: String!) {
    kbLoader(topicId: $topicId) {
      loadType
    }
  }
`;

const kbSearchArticlesQuery = `
  query kbSearchArticles($topicId: String!, $searchString: String!) {
    kbSearchArticles(topicId: $topicId, searchString: $searchString) {
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
  query getKbTopic($topicId: String!) {
    getKbTopic(topicId: $topicId) {
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
