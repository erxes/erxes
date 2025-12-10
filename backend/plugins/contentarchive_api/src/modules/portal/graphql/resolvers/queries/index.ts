import clientPortal from './portal';
import clientPortalUser from './clientPortalUser';
import clientPortalNotifications from './clientPortalNotifications';
import comment from './comment';
import fieldConfig from './fieldConfig';
import vercel from './vercel';
import categoryQueries from './category';
import postQueries from './post';
import pageQueries from './page';
import tagQueries from './tag';
import menuQueries from './menu';
import customPostTypeQueries from './customPostType';

export default {
  ...clientPortal,
  ...clientPortalUser,
  ...clientPortalNotifications,
  ...comment,
  ...fieldConfig,
  ...vercel,

  ...categoryQueries,
  ...postQueries,
  ...pageQueries,
  ...tagQueries,
  ...menuQueries,
  ...customPostTypeQueries
};
