import { gql } from 'apollo-server-express';
import {
  mutations as PosUserMutations,
  queries as PosUserQueries,
  types as PosUserTypes
} from './schema/posUser';
import {
  mutations as OrderMutations,
  queries as OrderQueries,
  types as OrderTypes
} from './schema/orders';
import {
  mutations as BridgesMutations,
  queries as BridgesQueries,
  types as BridgesTypes
} from './schema/bridges';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './schema/configs';
import {
  queries as ProductQueries,
  types as ProductTypes
} from './schema/product';
import {
  queries as CoverQueries,
  types as CoverTypes,
  mutations as CoverMutations
} from './schema/covers';
import {
  queries as ReportQueries,
  types as ReportTypes
} from './schema/report';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${ProductTypes}
    ${PosUserTypes}
    ${OrderTypes}
    ${ConfigTypes}
    ${ReportTypes}
    ${BridgesTypes}
    ${CoverTypes}

   extend type Query {
    ${PosUserQueries}
    ${ProductQueries}
    ${OrderQueries}
    ${ConfigQueries}
    ${ReportQueries}
    ${BridgesQueries}
    ${CoverQueries}
   }

   extend type Mutation {
    ${PosUserMutations}
    ${OrderMutations}
    ${ConfigMutations}
    ${BridgesMutations}
    ${CoverMutations}
   }
  `;
};

export default typeDefs;
