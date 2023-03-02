import customScalars from '@erxes/api-utils/src/customScalars';

import { ClientPortalUser } from './clientPortalUser';
import ClientPortalComment from './comment';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query,

  ClientPortalUser,
  ClientPortalComment
};

export default resolvers;
