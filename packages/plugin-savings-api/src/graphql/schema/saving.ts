import {
  attachmentInput,
  attachmentType
} from '@erxes/api-utils/src/commonTypeDefs';
import {
  mutations as periodLockMutations,
  queries as periodLockQueries,
  types as periodLockTypes
} from './periodLock';
import {
  mutations as contractMutations,
  queries as contractQueries,
  types as contractTypes
} from './contract';
import {
  mutations as contractTypeMutations,
  queries as contractTypeQueries,
  types as contractTypeTypes
} from './contractType';

import {
  mutations as transactionMutations,
  queries as transactionQueries,
  types as transactionTypes
} from './transaction';

export const types = `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  extend type Company @key(fields: "_id") {
    _id: String! @external
  }
  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  
  ${periodLockTypes()},
  ${contractTypes()},
  ${contractTypeTypes()},
  ${transactionTypes},
`;

export const queries = `
  ${periodLockQueries},
  ${contractQueries},
  ${contractTypeQueries},
  ${transactionQueries},
`;

export const mutations = `
  ${periodLockMutations}
  ${contractMutations},
  ${contractTypeMutations},
  ${transactionMutations},
`;
