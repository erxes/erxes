import customScalars from '@erxes/api-utils/src/customScalars';

import SavingContract from './contract';
import ContractType from './contractType';
import PeriodLock from './periodLock';
import SavingTransaction from './transaction';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  PeriodLock,
  SavingContract,
  ContractType,
  SavingTransaction,
  Mutation,
  Query
});

export default resolvers;
