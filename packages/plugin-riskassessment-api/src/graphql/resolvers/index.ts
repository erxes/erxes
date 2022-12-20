import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

import RiskAssessment from '../../dataLoaders/resolvers/riskAssessment';
import RiskConformity from '../../dataLoaders/resolvers/riskConfirmity';
import RiskFormSubmission from '../../dataLoaders/resolvers/riskFormSubmission';
import FormSubmissionUserType from '../../dataLoaders/resolvers/riskFormSubmissionUsers';
import RiskAssessmentConfigs from '../../dataLoaders/resolvers/riskAssessmentConfigs';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  RiskConformity,
  RiskAssessment,
  RiskFormSubmission,
  FormSubmissionUserType,
  RiskAssessmentConfigs,

  Mutation,
  Query
});

export default resolvers;
