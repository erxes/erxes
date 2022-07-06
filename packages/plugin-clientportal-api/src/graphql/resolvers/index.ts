import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';
import { ClientPortalUser } from './clientPortalUser';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query,

  ClientPortalUser
};

export default resolvers;
