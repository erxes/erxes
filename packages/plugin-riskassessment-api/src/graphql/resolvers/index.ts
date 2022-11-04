import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

import RiskAssessment from '../../dataLoaders/resolvers/riskAssessment';
import RiskConfirmity from '../../dataLoaders/resolvers/riskConfirmity';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  RiskConfirmity,
  RiskAssessment,

  Mutation,
  Query
});

export default resolvers;
