import customScalars from '@erxes/api-utils/src/customScalars';
import { rfcaMutations, rfcaIssuesMutations } from './mutations';
import { rfcaQueries, rfcaQuestionQueries } from './queries';
import customResolvers from '../customResolvers';

const resolvers: any = async (serviceDiscovery: any) => ({
  ...customScalars,
  ...customResolvers,
  Mutation: {
    ...rfcaMutations,
    ...rfcaIssuesMutations
  },
  Query: {
    ...rfcaQueries,
    ...rfcaQuestionQueries
  }
});

export default resolvers;
