import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { msdynamicSyncMutations, msdynamicCheckMutations } from './mutations';
import Query from './queries';
import SyncMsdHistory from './customResolvers/syncLog';

const resolvers: any = {
  ...apolloCustomScalars,
  SyncMsdHistory,
  Mutation: {
    ...msdynamicSyncMutations,
    ...msdynamicCheckMutations,
  },
  Query,
};

export default resolvers;
