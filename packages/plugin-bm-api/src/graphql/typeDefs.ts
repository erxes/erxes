import gql from 'graphql-tag';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

import {
  types as elementTypes,
  queries as elementQueries,
  mutations as elementMutations,
} from './schema/element';

import {
  types as itineraryTypes,
  queries as itineraryQueries,
  mutations as itineraryMutations,
} from './schema/itinerary';

import {
  types as tourTypes,
  queries as tourQueries,
  mutations as tourMutations,
} from './schema/tour';

import {
  types as branchTypes,
  queries as branchQueries,
  mutations as branchMutations,
} from './schema/bmsbranch';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    
    ${elementTypes()}
    ${itineraryTypes()}
    ${tourTypes()}
    ${branchTypes()}
    extend type Query {
      ${itineraryQueries}
      ${elementQueries}
      ${tourQueries}
      ${branchQueries}
    }
    
    extend type Mutation {
      ${elementMutations}
      ${itineraryMutations}
      ${tourMutations}
      ${branchMutations}
    }
  `;
};

export default typeDefs;
