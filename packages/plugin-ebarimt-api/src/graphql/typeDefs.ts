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
import {
  mutations as productGroupMutations,
  queries as productGroupQueries,
  types as productGroupTypes
} from './schema/productGroup';

import gql from 'graphql-tag';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${ebarimtTypes}
    ${productRuleTypes}
    ${productGroupTypes}
    
    extend type Query {
      ${ebarimtQueries}
      ${productRuleQueries}
      ${productGroupQueries}
    }

    extend type Mutation {
      ${ebarimtMutations}
      ${productRuleMutations}
      ${productGroupMutations}
    }

  `;
};

export default typeDefs;
