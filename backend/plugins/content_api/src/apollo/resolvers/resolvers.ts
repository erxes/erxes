import cmsResolvers from '@/cms/graphql/customeResolvers';
import webBuilderCustomResolvers from '@/webbuilder/graphql/customeResolvers';


export const customResolvers = {
  ...cmsResolvers,
  ...webBuilderCustomResolvers,
};
