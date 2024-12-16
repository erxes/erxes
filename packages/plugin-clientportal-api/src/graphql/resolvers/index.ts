import customScalars from '@erxes/api-utils/src/customScalars';

import { ClientPortalUser, ClientPortalParticipant } from './clientPortalUser';
import { ClientPortalCompany } from './clientPortalCompany';
import ClientPortalNotification from './clientPortalNotification';
import ClientPortalComment from './comment';
import { ClientPortal } from './clientPortal';
import Mutation from './mutations';
import Query from './queries';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query,

  ClientPortal,
  ClientPortalNotification,
  ClientPortalUser,
  ClientPortalParticipant,
  ClientPortalComment,
  ClientPortalCompany,
};

export default resolvers;
