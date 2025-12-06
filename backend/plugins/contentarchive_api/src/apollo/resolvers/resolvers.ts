import kbResolvers from '~/modules/knowledgebase/graphql/resolvers/customResolvers';
import portalResolvers from '~/modules/portal/graphql/resolvers/customResolvers';

export const customResolvers = {
  ...kbResolvers,
  ...portalResolvers,
};
