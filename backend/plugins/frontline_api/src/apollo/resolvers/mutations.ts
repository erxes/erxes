import { channelMutations } from '@/channel/graphql/resolvers/mutations/channel';
import { conversationMutations } from '@/inbox/graphql/resolvers/mutations/conversations';
import { integrationMutations } from '@/inbox/graphql/resolvers/mutations/integrations';
import { cpInboxMutations } from '@/inbox/graphql/resolvers/mutations/clientPortal';
import { widgetMutations } from '@/inbox/graphql/resolvers/mutations/widget';
import callMutations from '@/integrations/call/graphql/resolvers/mutations';
import callProMutations from '@/integrations/callpro/graphql/resolvers/mutations';
import { facebookMutations } from '@/integrations/facebook/graphql/resolvers/mutations';
import { discordMutations } from '@/integrations/discord/graphql/resolvers/mutations';
import { instagramMutations } from '@/integrations/instagram/graphql/resolvers/mutations';
import { mailMutations } from '@/integrations/mail/graphql/resolvers/mutations';
import { knowledgeBaseMutations } from '@/knowledgebase/graphql/resolvers/mutations/knowledgeBaseMutations';
import { reportChartMutations } from '@/reports/graphql/resolvers/chartMutations';
import { reportFacebookMutations } from '@/reports/graphql/resolvers/facebookMutations';
import { reportInboxQueries } from '@/reports/graphql/resolvers/inboxQueries';
import { reportTicketQueries } from '@/reports/graphql/resolvers/ticketQueries';
import { fieldMutations } from '~/modules/form/graphql/resolvers/mutations/fields';
import { formMutations } from '~/modules/form/graphql/resolvers/mutations/forms';
import { widgetFormMutation } from '~/modules/form/graphql/resolvers/mutations/widget';
import { pollMutations } from '~/modules/poll/graphql/resolvers/mutations/polls';
import { widgetPollMutations } from '~/modules/poll/graphql/resolvers/mutations/widget';
import { widgetPollPopupMutations } from '~/modules/poll/graphql/resolvers/mutations/widgetPopup';
import { responseTemplateMutations } from '~/modules/response/graphql/responseTemplateMutations';
import ticketMutations from '~/modules/ticket/graphql/resolvers/mutations';

export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
  ...cpInboxMutations,
  ...facebookMutations,
  ...discordMutations,
  ...instagramMutations,
  ...callMutations,
  ...callProMutations,
  ...mailMutations,
  ...ticketMutations,
  ...widgetMutations,
  ...responseTemplateMutations,
  ...formMutations,
  ...widgetFormMutation,
  ...fieldMutations,
  ...pollMutations,
  ...widgetPollMutations,
  ...widgetPollPopupMutations,
  ...knowledgeBaseMutations,
  ...reportInboxQueries,
  ...reportTicketQueries,
  ...reportChartMutations,
  ...reportFacebookMutations,
};
