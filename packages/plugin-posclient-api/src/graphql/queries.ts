import { loyaltiesQueries } from './loyalties';

const knowledgeBaseTopicDetail = `
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      _id
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
        articles{
          title
          status
          content
          summary
        }
      }
    }
  }
`;

export default { knowledgeBaseTopicDetail, ...loyaltiesQueries };
