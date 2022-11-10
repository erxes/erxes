import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalNotifications from './clientPortalNotifications';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalNotifications
};
