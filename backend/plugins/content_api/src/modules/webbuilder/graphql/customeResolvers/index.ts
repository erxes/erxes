import WebPage from '@/webbuilder/graphql/customeResolvers/webPage';
import WebPost from '@/webbuilder/graphql/customeResolvers/webPosts';
import WebMenu from '@/webbuilder/graphql/customeResolvers/webMenu';

export default {
  WebPage,
  ...WebPost,
  ...WebMenu,
};

