import categoryMutations from './category';
import postMutations from './post';
import pageMutations from './page';
import tagMutations from './tag';
import menuMutations from './menu';
import customPostTypeMutations from './customPostType';
import clientPortal from './clientPortal';
import { clientPortalUserMutations, userMutations } from './clientPortalUser';
import clientPortalUserPost from './clientPortalUserPost';
import notificationMutations from './clientPortalNotifications';
import comment from './comment';
import fieldConfig from './fieldConfig';
import vercel from './vercel';

export default {
  ...categoryMutations,
  ...postMutations,
  ...pageMutations,
  ...tagMutations,
  ...menuMutations,
  ...customPostTypeMutations,

  ...clientPortal,
  ...clientPortalUserMutations,
  ...userMutations,
  ...clientPortalUserPost,
  ...notificationMutations,
  ...comment,
  ...fieldConfig,
  ...vercel,
};
