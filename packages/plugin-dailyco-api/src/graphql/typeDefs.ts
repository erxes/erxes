import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

const types: string = `

`;

const queries: string = `
  videoCallUsageStatus: JSON
`;

const mutations: string = `
  
`;

const typeDefs: DocumentNode = gql`
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

export default typeDefs;
