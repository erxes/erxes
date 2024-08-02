import customScalars from '@erxes/api-utils/src/customScalars';

import Collateral from './collateral';
import LoanContract from './contract';
import ContractType from './contractType';
import InsuranceType from './insuranceType';
import LoanInvoice from './invoice';
import LoanSchedule from './schedule';
import PeriodLock from './periodLock';
import LoanTransaction from './transaction';
import Classification from './classification';
import LoanNonBalanceTransaction from './nonBalanceTransaction';
import CollateralType from './collateralType';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  PeriodLock,
  Collateral,
  LoanContract,
  ContractType,
  InsuranceType,
  LoanInvoice,
  LoanSchedule,
  LoanTransaction,
  LoanNonBalanceTransaction,
  Classification,
  CollateralType,
  Mutation,
  Query
});

export default resolvers;
