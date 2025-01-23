import clientPortal from './clientPortal';
import clientPortalUser from './clientPortalUser';
import clientPOrtalUserPost from './clientPortalUserPost';
import clientPortalMutations from './clientPortalNotifications';
import comment from './comment';
import fieldConfig from './fieldConfig';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalMutations,
  ...comment,
  ...fieldConfig,
  ...clientPOrtalUserPost,
};
