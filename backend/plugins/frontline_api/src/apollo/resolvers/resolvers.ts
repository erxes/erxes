import inboxResolvers from '@/inbox/graphql/resolvers/customResolvers';
import integrationFacebookResolvers from '@/integrations/facebook/graphql/resolvers/customResolvers';
import { Channel } from '@/channel/graphql/resolvers/customResolvers/channel';
import { ChannelMember } from '@/channel/graphql/resolvers/customResolvers/member';

export const customResolvers = {
  ...inboxResolvers,
  ...integrationFacebookResolvers,
  Channel,
  ChannelMember,
};
