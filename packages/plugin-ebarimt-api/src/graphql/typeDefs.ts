import {
  mutations as ebarimtMutations,
  queries as ebarimtQueries,
  types as ebarimtTypes
} from './schema/ebarimt';
import {
  mutations as productRuleMutations,
  queries as productRuleQueries,
  types as productRuleTypes
} from './schema/productRule';

import gql from 'graphql-tag';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${ebarimtTypes}
    ${productRuleTypes}
    
    extend type Query {
      ${ebarimtQueries}
      ${productRuleQueries}
    }

    extend type Mutation {
      ${ebarimtMutations}
      ${productRuleMutations}
    }

  `;
};

export default typeDefs;
