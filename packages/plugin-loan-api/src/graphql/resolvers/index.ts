import customScalars from '@erxes/api-utils/src/customScalars';

import Collaterals from './collateral';
import Contracts from './contract';
import contractTypeResolvers from './contractType';
import InsuranceTypes from './insuranceType';
import Invoices from './invoice';
import Schedules from './schedule';
import Transactions from './transaction';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,

  Collaterals,
  Contracts,
  contractTypeResolvers,
  InsuranceTypes,
  Invoices,
  Schedules,
  Transactions,

  Mutation,
  Query
});

export default resolvers;
