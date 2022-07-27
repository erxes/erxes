const Query = ` 
  extend type Query {
    cmsTopicById(_id: String!): CmsTopic
    cmsAllTopics(): [CmsTopic]
  }
`;

export default Query;
