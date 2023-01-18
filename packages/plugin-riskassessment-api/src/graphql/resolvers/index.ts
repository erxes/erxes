import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

import RiskIndicator from '../../dataLoaders/resolvers/riskIndicator';
import RiskConformity from '../../dataLoaders/resolvers/riskConfirmity';
import RiskFormSubmission from '../../dataLoaders/resolvers/riskFormSubmission';
import FormSubmissionUserType from '../../dataLoaders/resolvers/riskFormSubmissionUsers';
import RiskIndicatorConfigs from '../../dataLoaders/resolvers/riskIndicatorConfigs';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  RiskConformity,
  RiskIndicator,
  RiskFormSubmission,
  FormSubmissionUserType,
  RiskIndicatorConfigs,

  Mutation,
  Query
});

export default resolvers;
