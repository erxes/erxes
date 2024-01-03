import customScalars from '@erxes/api-utils/src/customScalars';
import { rfcaIssuesMutations, rcfaMutations } from './mutations';
import { rfcaQueries, rfcaQuestionQueries } from './queries';
import customResolvers from '../customResolvers';

const resolvers: any = async (serviceDiscovery: any) => ({
  ...customScalars,
  ...customResolvers,
  Mutation: {
    ...rfcaIssuesMutations,
    ...rcfaMutations
  },
  Query: {
    ...rfcaQueries,
    ...rfcaQuestionQueries
  }
});

export default resolvers;
