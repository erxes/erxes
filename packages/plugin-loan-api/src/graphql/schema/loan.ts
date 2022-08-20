import {
  mutations as adjustmentMutations,
  queries as adjustmentQueries,
  types as adjustmentTypes
} from './adjustment';
import {
  queries as collateralQueries,
  types as collateralTypes
} from './collateral';
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
  queries as erkhetResponseQueries,
  types as erkhetResponseTypes
} from './erkhetResponse';
import {
  mutations as insuranceTypeMutations,
  queries as insuranceTypeQueries,
  types as insuranceTypeTypes
} from './insuranceType';
import {
  mutations as invoiceMutations,
  queries as invoiceQueries,
  types as invoiceTypes
} from './invoice';
import {
  mutations as scheduleMutations,
  queries as scheduleQueries,
  types as scheduleTypes
} from './schedule';
import {
  mutations as transactionMutations,
  queries as transactionQueries,
  types as transactionTypes
} from './transaction';

export const types = `
  ${adjustmentTypes()},
  ${contractTypes()},
  ${collateralTypes()}
  ${contractTypeTypes()},
  ${insuranceTypeTypes()},

  ${scheduleTypes()},
 

`;

export const queries = `
  ${adjustmentQueries},
  ${contractQueries},
  ${collateralQueries}
  ${contractTypeQueries},
  ${insuranceTypeQueries},
  ${invoiceQueries},
  ${scheduleQueries},
  ${transactionQueries},
  ${erkhetResponseQueries},
`;

export const mutations = `
  ${adjustmentMutations}
  ${contractMutations},
  ${contractTypeMutations},
  ${insuranceTypeMutations},
  ${invoiceMutations},
  ${scheduleMutations},
  ${transactionMutations},
`;
