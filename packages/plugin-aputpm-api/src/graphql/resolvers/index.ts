import customScalars from '@erxes/api-utils/src/customScalars';

import queries from './queries';
import safetyTipQueries from './safetyTip/queries';
import SafetyTipMutations from './safetyTip/mutations';
import customResolvers from './customResolvers';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  ...customResolvers,
  Query: {
    ...queries,
    ...safetyTipQueries
  },
  Mutation: {
    ...SafetyTipMutations
  }
});

export default resolvers;
