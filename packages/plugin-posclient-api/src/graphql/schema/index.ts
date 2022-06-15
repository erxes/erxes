import { gql } from 'apollo-server-express';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './user';
import { queries as LogQueries, types as LogTypes } from './logs';
import {
  queries as ErxesQueries,
  types as ErxesTypes,
  mutations as ErxesMutations
} from './erxes';

import {
  mutations as PosUserMutations,
  queries as PosUserQueries,
  types as PosUserTypes
} from './posUser';
import {
  mutations as CustomerMutations,
  queries as CustomerQueries,
  types as CustomerTypes
} from './customer';
import {
  mutations as OrderMutations,
  queries as OrderQueries,
  types as OrderTypes
} from './orders';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './configs';
import {
  mutations as PaymentMutations,
  queries as PaymentQueries,
  types as PaymentTypes
} from './payment';
import { queries as ProductQueries, types as ProductTypes } from './product';
import { queries as ReportQueries, types as ReportTypes } from './report';
import { types as CompanyTypes } from './company';

const types = `
  scalar JSON
  scalar Date
  ${UserTypes}
  ${LogTypes}
  ${ErxesTypes}

  ${PosUserTypes}
  ${ProductTypes}
  ${CompanyTypes}
  ${CustomerTypes}
  ${OrderTypes}
  ${ConfigTypes}
  ${PaymentTypes}
  ${ReportTypes}
`;

const queries = `
  type Query {
    ${UserQueries}
    ${LogQueries}
    ${ErxesQueries}

    ${PosUserQueries}
    ${ProductQueries}
    ${OrderQueries}
    ${ConfigQueries}
    ${CustomerQueries}
    ${PaymentQueries}
    ${ReportQueries}
  }
`;

const mutations = `
  type Mutation {
    ${UserMutations}
    ${PosUserMutations}
    ${OrderMutations}
    ${ConfigMutations}
    ${PaymentMutations}
    ${CustomerMutations}
    ${ErxesMutations}
  }
`;

const subscriptions = `
  type Subscription {
    ordersOrdered(statuses: [String]): Order
  }
`;

const typeDefs = gql(`${types} ${queries} ${mutations} ${subscriptions}`);

export default typeDefs;
