import { apolloCustomScalars } from 'erxes-api-shared/utils';
import msdynamicMutations from './mutations';
import Query from './queries';
import SyncMsdHistory from './customResolvers/syncLog';

const resolvers: any = {
  ...apolloCustomScalars,
  SyncMsdHistory,
  Mutation: {
    ...msdynamicMutations
  },
  Query,
};

export default resolvers;
