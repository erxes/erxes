import { channelMutations } from '@/inbox/graphql/resolvers/mutations/channels';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '@/inbox/graphql/resolvers/mutations/integrations';
import { facebookMutations } from '@/integrations/facebook/graphql/resolvers/mutations';
import callMutations from '@/integrations/call/graphql/resolvers/mutations';
import { imapMutations } from '@/integrations/imap/graphql/resolvers/mutations';

export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
  ...facebookMutations,
  ...callMutations,
  ...imapMutations,
};
