import {
  mutations as accountMutations,
  queries as accountQueries,
  types as accountTypes,
} from '@/accounting/graphql/schemas/account';
import {
  mutations as accountingsConfigMutations,
  queries as accountingsConfigQueries,
  types as accountingsConfigTypes,
} from '@/accounting/graphql/schemas/config';
import {
  mutations as ctaxRowMutations,
  queries as ctaxRowQueries,
  types as ctaxRowTypes,
} from '@/accounting/graphql/schemas/ctaxRow';
import extendTypes from '@/accounting/graphql/schemas/extendTypes';
import {
  mutations as accInventoryMutations,
  queries as accInventoryQueries,
  types as accInventoryTypes,
} from '@/accounting/graphql/schemas/inventories';
import {
  queries as journalReportQueries,
  types as journalReportTypes,
} from '@/accounting/graphql/schemas/journalReports';
import {
  mutations as transactionMutations,
  queries as transactionQueries,
  types as transactionTypes,
} from '@/accounting/graphql/schemas/transactionCommon';
import {
  mutations as vatRowMutations,
  queries as vatRowQueries,
  types as vatRowTypes,
} from '@/accounting/graphql/schemas/vatRow';
import {
  mutations as adjustInventoryMutations,
  queries as adjustInventoryQueries,
  types as adjustInventoryTypes,
} from '~/modules/accounting/graphql/schemas/adjustInvDetail';
import {
  mutations as remainderMutations,
  queries as remainderQueries,
  types as remainderTypes,
} from '~/modules/inventories/graphql/schemas/remainder';
import {
  mutations as reserveRemsMutations,
  queries as reserveRemsQueries,
  types as reserveRemsTypes,
} from '~/modules/inventories/graphql/schemas/reserveRems';
import {
  mutations as safeRemainderMutations,
  queries as safeRemainderQueries,
  types as safeRemainderTypes,
} from '~/modules/inventories/graphql/schemas/safeRemainder';
import {
  mutations as safeRemainderItemMutations,
  queries as safeRemainderItemQueries,
  types as safeRemainderItemTypes,
} from '~/modules/inventories/graphql/schemas/safeRemainderItem';

export const types = `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type SomeType {
    visibility: CacheControlScope
  }
  ${extendTypes}
  ${accountTypes()}
  ${vatRowTypes()}
  ${ctaxRowTypes()}
  ${accountingsConfigTypes}
  ${transactionTypes()}
  ${accInventoryTypes}
  ${adjustInventoryTypes}
  ${journalReportTypes}
  ${remainderTypes}
  ${reserveRemsTypes}
  ${safeRemainderTypes}
  ${safeRemainderItemTypes}
`;

export const queries = `
  ${accountQueries}
  ${accountingsConfigQueries}
  ${vatRowQueries}
  ${ctaxRowQueries}
  ${transactionQueries}
  ${accInventoryQueries}
  ${adjustInventoryQueries}
  ${journalReportQueries}
  ${remainderQueries}
  ${reserveRemsQueries}
  ${safeRemainderQueries}
  ${safeRemainderItemQueries}
`;

export const mutations = `
  ${accountMutations}
  ${accountingsConfigMutations}
  ${vatRowMutations}
  ${ctaxRowMutations}
  ${transactionMutations}
  ${accInventoryMutations}
  ${adjustInventoryMutations}
  ${remainderMutations}
  ${reserveRemsMutations}
  ${safeRemainderMutations}
  ${safeRemainderItemMutations}
`;

export default { types, queries, mutations };
