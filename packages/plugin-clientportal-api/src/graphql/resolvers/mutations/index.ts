import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalMutations from './clientPortalNotifications';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalMutations
};
