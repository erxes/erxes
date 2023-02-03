import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalNotifications from './clientPortalNotifications';
import comment from './comment';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalNotifications,
  ...comment
};
