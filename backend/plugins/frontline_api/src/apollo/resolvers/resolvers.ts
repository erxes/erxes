import inboxResolvers from '@/inbox/graphql/resolvers/customResolvers';
import integrationFacebookResolvers from '@/integrations/facebook/graphql/resolvers/customResolvers';

export const customResolvers = {
  ...inboxResolvers,
  ...integrationFacebookResolvers,
};
