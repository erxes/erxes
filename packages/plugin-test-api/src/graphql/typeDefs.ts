import gql from 'graphql-tag';

import {
  types as TemplateTypes,
  queries as TemplateQueries,
  mutations as TemplateMutations,
} from './schema/template'

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${TemplateTypes}
    
    extend type Query {
      ${TemplateQueries}
    }
    
    extend type Mutation {
      ${TemplateMutations}
    }
  `;
};

export default typeDefs;
