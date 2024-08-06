import customScalars from '@erxes/api-utils/src/customScalars';
import { CheckDynamic, SyncDynamic } from './mutations';
import Query from './queries';
import SyncMsdHistory from './syncLog';

const resolvers: any = async () => ({
  ...customScalars,
  SyncMsdHistory,
  Mutation: {
    ...SyncDynamic,
    ...CheckDynamic,
  },
  Query,
});

export default resolvers;
