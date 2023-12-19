import customScalars from '@erxes/api-utils/src/customScalars';

import { SendDynamic, CheckDynamic, SyncDynamic } from './mutations';
import Query from './queries';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...SendDynamic,
    ...SyncDynamic,
    ...CheckDynamic
  },
  Query
});

export default resolvers;
