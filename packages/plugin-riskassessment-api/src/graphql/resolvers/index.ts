import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

import RiskConfirmity from '../../dataLoaders/resolvers/riskConfirmity';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  RiskConfirmity,

  Mutation,
  Query
});

export default resolvers;
