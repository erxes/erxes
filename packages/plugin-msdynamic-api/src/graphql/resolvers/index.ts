import customScalars from '@erxes/api-utils/src/customScalars';

import { SendDynamic, CheckDynamic, SyncDynamic } from './mutations';
import Query from './queries';

import SyncHistory from './syncLog';

const resolvers: any = async () => ({
  ...customScalars,
  SyncHistory,
  Mutation: {
    ...SendDynamic,
    ...SyncDynamic,
    ...CheckDynamic,
  },
  Query,
});

export default resolvers;
