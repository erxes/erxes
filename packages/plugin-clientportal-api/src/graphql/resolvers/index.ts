import customScalars from '@erxes/api-utils/src/customScalars';

import { ClientPortalUser } from './clientPortalUser';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query,

  ClientPortalUser
};

export default resolvers;
