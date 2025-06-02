import customScalars from '@erxes/api-utils/src/customScalars';
import syncHistoriesPolaris from './queries/syncHistoriesPolaris';
import pullPolarisQueries from './queries/pullPolaris';
import savingsQueries from './queries/savings';
import SyncHistoryPolaris from './syncLog';
import syncMutations from './mutations/syncData';
import checkMutations from './mutations/checkSynced';
import savings from './mutations/savings';
import loans from './mutations/loans';
const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistoryPolaris,
  Query: {
    ...syncHistoriesPolaris,
    ...pullPolarisQueries,
    ...savingsQueries
  },

  Mutation: {
    ...syncMutations,
    ...checkMutations,
    ...savings,
    ...loans
  }
});

export default resolvers;
