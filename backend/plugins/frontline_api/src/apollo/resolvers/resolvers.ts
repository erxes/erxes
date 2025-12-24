import inboxResolvers from '@/inbox/graphql/resolvers/customResolvers';
import integrationFacebookResolvers from '@/integrations/facebook/graphql/resolvers/customResolvers';
import { Channel } from '@/channel/graphql/resolvers/customResolvers/channel';
import { ChannelMember } from '@/channel/graphql/resolvers/customResolvers/member';
import { Pipeline } from '@/ticket/graphql/resolvers/customResolvers/pipeline';
import { Ticket } from '@/ticket/graphql/resolvers/customResolvers/status';
import { Form } from '@/form/graphql/resolvers/customResolvers/forms';

export const customResolvers = {
  ...inboxResolvers,
  ...integrationFacebookResolvers,
  Channel,
  ChannelMember,
  Pipeline,
  Ticket,
  Form,
};
