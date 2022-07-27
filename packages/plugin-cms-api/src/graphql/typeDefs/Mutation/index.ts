const Mutation = `
  extend type Mutation {
    cmsCreateTopic(name: String!): CmsTopic
  }
`;

export default Mutation;
