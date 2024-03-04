import customScalars from '@erxes/api-utils/src/customScalars';
import syncHistories from './queries/syncHistories';
import SyncHistory from './syncLog';
import customerCheckMutations from './mutations/checkCustomer';
import checkLoanAcntMutations from './mutations/checkLoanAccounts';
import checkSavingAcntMutations from './mutations/checkSaving';
const resolvers: any = async (_serviceDiscovery) => ({
  ...customScalars,
  SyncHistory,
  Query: {
    ...syncHistories,
  },

  Mutation: {
    ...customerCheckMutations,
    ...checkLoanAcntMutations,
    ...checkSavingAcntMutations,
  },
});

export default resolvers;
