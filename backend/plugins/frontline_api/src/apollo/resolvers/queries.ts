import { channelQueries } from '@/channel/graphql/resolvers/queries/channel';
import { conversationQueries } from '@/inbox/graphql/resolvers/queries/conversations';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { cpInboxQueries } from '@/inbox/graphql/resolvers/queries/clientPortal';
import { widgetQueries } from '@/inbox/graphql/resolvers/queries/widget';
import callQueries from '@/integrations/call/graphql/resolvers/queries';
import callProQueries from '@/integrations/callpro/graphql/resolvers/queries';
import { facebookQueries } from '@/integrations/facebook/graphql/resolvers/queries';
import { discordQueries } from '@/integrations/discord/graphql/resolvers/queries';
import { instagramQueries } from '@/integrations/instagram/graphql/resolvers/queries';
import { mailQueries } from '@/integrations/mail/graphql/resolvers/queries';
import { knowledgeBaseQueries } from '@/knowledgebase/graphql/resolvers/queries/knowledgeBaseQueries';
import { reportCallQueries } from '@/reports/graphql/resolvers/callQueries';
import { reportChartQueries } from '@/reports/graphql/resolvers/chartQueries';
import { reportFacebookQueries } from '@/reports/graphql/resolvers/facebookQueries';
import { reportInboxQueries } from '@/reports/graphql/resolvers/inboxQueries';
import { reportTicketQueries } from '@/reports/graphql/resolvers/ticketQueries';
import ticketQueries from '@/ticket/graphql/resolvers/queries';
import { fieldQueries } from '~/modules/form/graphql/resolvers/queries/fields';
import formQueries from '~/modules/form/graphql/resolvers/queries/forms';
import { pollQueries } from '~/modules/poll/graphql/resolvers/queries/polls';
import { widgetPollQueries } from '~/modules/poll/graphql/resolvers/queries/widget';
import { responseTemplateQueries } from '~/modules/response/graphql/responseTemplateQueries';

export const queries = {
  ...channelQueries,
  ...conversationQueries,
  ...integrationQueries,
  ...cpInboxQueries,
  ...facebookQueries,
  ...discordQueries,
  ...instagramQueries,
  ...callQueries,
  ...callProQueries,
  ...mailQueries,
  ...ticketQueries,
  ...widgetQueries,
  ...responseTemplateQueries,
  ...formQueries,
  ...fieldQueries,
  ...pollQueries,
  ...widgetPollQueries,
  ...reportInboxQueries,
  ...reportTicketQueries,
  ...reportFacebookQueries,
  ...reportChartQueries,
  ...reportCallQueries,
  ...knowledgeBaseQueries,
};
