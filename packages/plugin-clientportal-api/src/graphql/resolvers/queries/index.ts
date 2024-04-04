import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPortalNotifications from './clientPortalNotifications';
import comment from './comment';
import fieldConfig from './fieldConfig';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalNotifications,
  ...comment,
  ...fieldConfig
};
