import customScalars from '@erxes/api-utils/src/customScalars';

import queries from './queries';
import mutations from './mutations';
import safetyTipQueries from './safetyTip/queries';
import SafetyTipMutations from './safetyTip/mutations';
import customResolvers from './customResolvers';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,
  Query: {
    ...queries,
    ...safetyTipQueries,
  },
  Mutation: {
    ...mutations,
    ...SafetyTipMutations,
  },
});

export default resolvers;
