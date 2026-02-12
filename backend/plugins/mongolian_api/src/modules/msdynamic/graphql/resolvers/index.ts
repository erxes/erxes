import { apolloCustomScalars } from 'erxes-api-shared/utils';
import { CheckDynamic, SyncDynamic } from './mutations';
import Query from './queries';
import SyncMsdHistory from './customResolvers/syncLog';

const resolvers: any = {
  ...apolloCustomScalars,
  SyncMsdHistory,
  Mutation: {
    ...SyncDynamic,
    ...CheckDynamic,
  },
  Query,
};

export default resolvers;
