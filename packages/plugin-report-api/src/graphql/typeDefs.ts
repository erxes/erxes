import gql from 'graphql-tag';

const types = `
  type GeneralReport @key(fields: "_id") {
    _id: String!
    name: String

    contentType: String
    content: ReportContent
    createdAt: Date
    updatedAt: Date
    createdBy: String
  }


  type ReportContent {
    type: String
    data: JSON
  }
`;

const queries = `
  reports(typeId: String): [GeneralReport]
  reportDetail(_id: String): GeneralReport
`;

const params = `
  contentType: String!
`;

const mutations = `
  reportsAdd(${params}): GeneralReport
`;

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
