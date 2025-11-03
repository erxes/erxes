import { channelMutations } from '@/channel/graphql/resolvers/mutations/channel';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '@/inbox/graphql/resolvers/mutations/integrations';
import { facebookMutations } from '@/integrations/facebook/graphql/resolvers/mutations';
import callMutations from '@/integrations/call/graphql/resolvers/mutations';
import { imapMutations } from '@/integrations/imap/graphql/resolvers/mutations';
import { widgetMutations } from '@/inbox/graphql/resolvers/mutations/widget';

export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
  ...facebookMutations,
  ...callMutations,
  ...imapMutations,
  ...widgetMutations
};
