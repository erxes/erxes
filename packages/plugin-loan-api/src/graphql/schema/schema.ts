import {
  mutations as adjustmentMutations, queries as adjustmentQueries, types as adjustmentTypes
} from '../schema/adjustment';
import { queries as collateralQueries, types as collateralTypes } from '../schema/collateral';
import {
  mutations as contractMutations, queries as contractQueries, types as contractTypes
} from '../schema/contract';
import {
  mutations as contractTypeMutations, queries as contractTypeQueries, types as contractTypeTypes
} from '../schema/contractType';
import {
  queries as erkhetResponseQueries, types as erkhetResponseTypes
} from '../schema/erkhetResponse';
import {
  mutations as insuranceTypeMutations, queries as insuranceTypeQueries,
  types as insuranceTypeTypes
} from '../schema/insuranceType';
import {
  mutations as invoiceMutations, queries as invoiceQueries, types as invoiceTypes
} from '../schema/invoice';
import {
  mutations as scheduleMutations, queries as scheduleQueries, types as scheduleTypes
} from '../schema/schedule';
import {
  mutations as transactionMutations, queries as transactionQueries, types as transactionTypes
} from '../schema/transaction';

export const types = `
  ${adjustmentTypes},
  ${contractTypes},
  ${collateralTypes}
  ${contractTypeTypes},
  ${insuranceTypeTypes},
  ${invoiceTypes},
  ${scheduleTypes},
  ${transactionTypes},
  ${erkhetResponseTypes},
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
