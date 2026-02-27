import { channelQueries } from '@/channel/graphql/resolvers/queries/channel';
import { conversationQueries } from '@/inbox/graphql/resolvers/queries/conversations';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { facebookQueries } from '@/integrations/facebook/graphql/resolvers/queries';
import callQueries from '@/integrations/call/graphql/resolvers/queries';
import { imapQueries } from '@/integrations/imap/graphql/resolvers/queries';
import { widgetQueries } from '@/inbox/graphql/resolvers/queries/widget';
import { pipelineQueries } from '@/ticket/graphql/resolvers/queries/pipeline';
import { statusQueries } from '@/ticket/graphql/resolvers/queries/status';
import { ticketQueries } from '@/ticket/graphql/resolvers/queries/ticket';
import { activityQueries } from '~/modules/ticket/graphql/resolvers/queries/activity';
import { noteQueries } from '@/ticket/graphql/resolvers/queries/note';
import { ticketConfigQueries } from '~/modules/ticket/graphql/resolvers/queries/ticketConfig';
import { responseTemplateQueries } from '~/modules/response/graphql/responseTemplateQueries';
import formQueries from '~/modules/form/graphql/resolvers/queries/forms';
import { fieldQueries } from '~/modules/form/graphql/resolvers/queries/fields';
import { reportInboxQueries } from '@/reports/graphql/resolvers/inboxQueries';
import { reportTicketQueries } from '@/reports/graphql/resolvers/ticketQueries';
import { knowledgeBaseQueries } from '@/knowledgebase/graphql/resolvers/queries/knowledgeBaseQueries';
import { knowledgeBaseCpQueries } from '~/modules/knowledgebase/graphql/resolvers/queries/knowledgeBaseCpQueries';

export const queries = {
  ...channelQueries,
  ...conversationQueries,
  ...integrationQueries,
  ...facebookQueries,
  ...callQueries,
  ...imapQueries,
  ...pipelineQueries,
  ...statusQueries,
  ...ticketQueries,
  ...widgetQueries,
  ...activityQueries,
  ...noteQueries,
  ...ticketConfigQueries,
  ...responseTemplateQueries,
  ...formQueries,
  ...fieldQueries,
  ...reportInboxQueries,
  ...reportTicketQueries,
  ...knowledgeBaseQueries,
  ...knowledgeBaseCpQueries,
};
