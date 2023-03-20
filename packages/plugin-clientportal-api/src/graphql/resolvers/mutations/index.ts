import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalMutations from './clientPortalNotifications';
import comment from './comment';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalMutations,
  ...comment
};
