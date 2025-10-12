import inboxResolvers from '~/modules/inbox/graphql/resolvers/customResolvers';
import integrationFacebookResolvers from '@/integrations/facebook/graphql/resolvers/customResolvers';
import { Channel } from '~/modules/channel/graphql/resolvers/customResolvers/channel';
import { ChannelMember } from '~/modules/channel/graphql/resolvers/customResolvers/member';

export const customResolvers = {
  ...inboxResolvers,
  ...integrationFacebookResolvers,
  Channel,
  ChannelMember,
};
