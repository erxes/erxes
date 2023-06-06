import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalMutations from './clientPortalNotifications';
import comment from './comment';
import fieldConfig from './fieldConfig';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalMutations,
  ...comment,
  ...fieldConfig
};
