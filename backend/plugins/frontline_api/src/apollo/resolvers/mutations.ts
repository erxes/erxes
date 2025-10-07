import { channelMutations } from '~/modules/channel/graphql/resolvers/mutations/channel';
import { conversationMutations } from '~/modules/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '~/modules/inbox/graphql/resolvers/mutations/integrations';
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
