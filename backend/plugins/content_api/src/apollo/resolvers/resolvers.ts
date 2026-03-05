import cmsResolvers from '@/cms/graphql/customeResolvers';
import webBuilderCustomResolvers from '@/webbuilder/graphql/customeResolvers';

import webPostCustomResolvers from '@/webbuilder/graphql/customeResolvers/webPosts';
import webMenuCustomResolvers from '@/webbuilder/graphql/customeResolvers/webMenu';

export const customResolvers = {
  ...cmsResolvers,
  ...webBuilderCustomResolvers,
  ...webPostCustomResolvers,
  ...webMenuCustomResolvers,
};
