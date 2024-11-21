import gql from 'graphql-tag';
import {
  types as categoryTypes,
  inputs as categoryInputs,
  queries as categoryQueries,
  mutations as categoryMutations,
} from './schemas/category';

import {
  types as postTypes,
  inputs as postInputs,
  queries as postQueries,
  mutations as postMutations,
} from './schemas/post';

import {
  types as pageTypes,
  inputs as pageInputs,
  queries as pageQueries,
  mutations as pageMutations,
} from './schemas/page';

import {
  types as tagTypes,
  inputs as tagInputs,
  queries as tagQueries,
  mutations as tagMutations,
} from './schemas/tag';


import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isClientportalEnabled = await isEnabled(
    'clientportal'
  );

  return gql`
    scalar JSON
    scalar Date

    ${categoryTypes({isClientportalEnabled})}
    ${postTypes}
    ${pageTypes}

    ${tagTypes}

    ${categoryInputs}
    ${postInputs}
    ${pageInputs}
    ${tagInputs}

    extend type Query {
      ${categoryQueries}
      ${postQueries}
      ${pageQueries}
      ${tagQueries}
    }
    
    extend type Mutation {
      ${categoryMutations}
      ${postMutations}
      ${pageMutations}
      ${tagMutations}
    }
  `;
};

export default typeDefs;
