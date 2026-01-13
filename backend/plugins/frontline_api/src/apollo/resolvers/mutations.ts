import { channelMutations } from '@/channel/graphql/resolvers/mutations/channel';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '@/inbox/graphql/resolvers/mutations/integrations';
import { facebookMutations } from '@/integrations/facebook/graphql/resolvers/mutations';
import callMutations from '@/integrations/call/graphql/resolvers/mutations';
import { imapMutations } from '@/integrations/imap/graphql/resolvers/mutations';
import { pipelineMutations } from '@/ticket/graphql/resolvers/mutations/pipeline';
import { noteMutations } from '@/ticket/graphql/resolvers/mutations/note';
import { statusMutations } from '@/ticket/graphql/resolvers/mutations/status';
import { ticketMutations } from '@/ticket/graphql/resolvers/mutations/ticket';
import { widgetMutations } from '@/inbox/graphql/resolvers/mutations/widget';
import { ticketConfigMutations } from '~/modules/ticket/graphql/resolvers/mutations/ticketConfig';
import { responseTemplateMutations } from '~/modules/response/graphql/responseTemplateMutations';
import { knowledgeBaseMutations } from '@/knowledgebase/graphql/resolvers/mutations/knowledgeBaseMutations';

export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
  ...facebookMutations,
  ...callMutations,
  ...imapMutations,
  ...pipelineMutations,
  ...statusMutations,
  ...ticketMutations,
  ...widgetMutations,
  ...noteMutations,
  ...ticketConfigMutations,
  ...responseTemplateMutations,
  ...knowledgeBaseMutations,
};
