import { gql } from 'apollo-server-express';

import {
  types as tumentechTypes,
  queries as tumentechQueries,
  mutations as tumentechMutations,
} from './schema/tumentech';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${await tumentechTypes()}

    extend type Query {
      ${tumentechQueries}
    }

    extend type Mutation {
      ${tumentechMutations}
    }
  `;
};

export default typeDefs;
