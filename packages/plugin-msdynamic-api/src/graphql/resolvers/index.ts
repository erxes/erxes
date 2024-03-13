import customScalars from '@erxes/api-utils/src/customScalars';

import { CheckDynamic, SyncDynamic } from './mutations';
import Query from './queries';

import SyncHistory from './syncLog';

const resolvers: any = async () => ({
  ...customScalars,
  SyncHistory,
  Mutation: {
    ...SyncDynamic,
    ...CheckDynamic,
  },
  Query,
});

export default resolvers;
