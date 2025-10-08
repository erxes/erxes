import gql from 'graphql-tag';
import {
  mutations as PosUserMutations,
  queries as PosUserQueries,
  types as PosUserTypes,
} from '@/posclient/graphql/schemas/posUser';
import {
  mutations as OrderMutations,
  queries as OrderQueries,
  types as OrderTypes,
} from '@/posclient/graphql/schemas/orders';
import {
  mutations as BridgesMutations,
  queries as BridgesQueries,
  types as BridgesTypes,
} from '@/posclient/graphql/schemas/bridges';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes,
} from '@/posclient/graphql/schemas/configs';
import {
  queries as ProductQueries,
  types as ProductTypes,
} from '@/posclient/graphql/schemas/product';
import {
  queries as CoverQueries,
  types as CoverTypes,
  mutations as CoverMutations,
} from '@/posclient/graphql/schemas/covers';
import {
  queries as ReportQueries,
  types as ReportTypes,
} from '@/posclient/graphql/schemas/report';

export const types = `
    extend type User @key(fields: "_id") {
      _id: String @external
    }

    ${ProductTypes}
    ${PosUserTypes}
    ${OrderTypes}
    ${ConfigTypes}
    ${ReportTypes}
    ${BridgesTypes}
    ${CoverTypes}
  `;

export const queries = `
    ${PosUserQueries}
    ${ProductQueries}
    ${OrderQueries}
    ${ConfigQueries}
    ${ReportQueries}
    ${BridgesQueries}
    ${CoverQueries}
`;

export const mutations = `
    ${PosUserMutations}
    ${OrderMutations}
    ${ConfigMutations}
    ${BridgesMutations}
    ${CoverMutations}
`;

export default { types, queries, mutations };
