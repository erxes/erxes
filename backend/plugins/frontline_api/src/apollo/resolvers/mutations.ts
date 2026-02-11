import { channelMutations } from '@/channel/graphql/resolvers/mutations/channel';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '@/inbox/graphql/resolvers/mutations/integrations';
import { widgetMutations } from '@/inbox/graphql/resolvers/mutations/widget';
import callMutations from '@/integrations/call/graphql/resolvers/mutations';
import { facebookMutations } from '@/integrations/facebook/graphql/resolvers/mutations';
import { imapMutations } from '@/integrations/imap/graphql/resolvers/mutations';
import { knowledgeBaseMutations } from '@/knowledgebase/graphql/resolvers/mutations/knowledgeBaseMutations';
import { reportInboxQueries } from '@/reports/graphql/resolvers/inboxQueries';
import { reportTicketQueries } from '@/reports/graphql/resolvers/ticketQueries';
import { fieldMutations } from '~/modules/form/graphql/resolvers/mutations/fields';
import { formMutations } from '~/modules/form/graphql/resolvers/mutations/forms';
import { widgetFormMutation } from '~/modules/form/graphql/resolvers/mutations/widget';
import { responseTemplateMutations } from '~/modules/response/graphql/responseTemplateMutations';
import ticketMutations from '~/modules/ticket/graphql/resolvers/mutations';

export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
  ...facebookMutations,
  ...callMutations,
  ...imapMutations,
  ...ticketMutations,
  ...widgetMutations,
  ...responseTemplateMutations,
  ...formMutations,
  ...widgetFormMutation,
  ...fieldMutations,
  ...knowledgeBaseMutations,
  ...reportInboxQueries,
  ...reportTicketQueries,
};
