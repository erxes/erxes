import customScalars from '@erxes/api-utils/src/customScalars';

import { ClientPortalUser, ClientPortalParticipant } from './clientPortalUser';
import ClientPortalNotification from './clientPortalNotification';
import ClientPortalComment from './comment';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query,

  ClientPortalNotification,
  ClientPortalUser,
  ClientPortalParticipant,
  ClientPortalComment,
};

export default resolvers;
