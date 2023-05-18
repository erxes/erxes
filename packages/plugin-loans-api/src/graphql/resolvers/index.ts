import customScalars from '@erxes/api-utils/src/customScalars';

import Collateral from './collateral';
import Contract from './contract';
import ContractType from './contractType';
import InsuranceType from './insuranceType';
import Invoice from './invoice';
import Schedule from './schedule';
import Transaction from './transaction';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,

  Collateral,
  Contract,
  ContractType,
  InsuranceType,
  Invoice,
  Schedule,
  Transaction,
  Mutation,
  Query
});

export default resolvers;
