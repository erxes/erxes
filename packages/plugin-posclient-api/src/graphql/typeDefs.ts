import { gql } from 'apollo-server-express';
import { queries as LogQueries, types as LogTypes } from './schema/logs';

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
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './schema/configs';
import {
  mutations as PaymentMutations,
  queries as PaymentQueries,
  types as PaymentTypes
} from './schema/payment';
import {
  queries as ProductQueries,
  types as ProductTypes
} from './schema/product';
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

    ${LogTypes}
    ${ProductTypes}
    ${PosUserTypes}
    ${OrderTypes}
    ${ConfigTypes}
    ${PaymentTypes}
    ${ReportTypes}

   extend type Query {
    ${LogQueries}
    ${PosUserQueries}
    ${ProductQueries}
    ${OrderQueries}
    ${ConfigQueries}
    ${PaymentQueries}
    ${ReportQueries}
   }



   extend type Mutation {
    ${PosUserMutations}
    ${OrderMutations}
    ${ConfigMutations}
    ${PaymentMutations}
   }
  `;
};

export default typeDefs;
