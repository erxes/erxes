import { channelQueries } from '@/channel/graphql/resolvers/queries/channel';
import { conversationQueries } from '@/inbox/graphql/resolvers/queries/conversations';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { widgetQueries } from '@/inbox/graphql/resolvers/queries/widget';
import callQueries from '@/integrations/call/graphql/resolvers/queries';
import { facebookQueries } from '@/integrations/facebook/graphql/resolvers/queries';
import { imapQueries } from '@/integrations/imap/graphql/resolvers/queries';
import { knowledgeBaseQueries } from '@/knowledgebase/graphql/resolvers/queries/knowledgeBaseQueries';
import { reportInboxQueries } from '@/reports/graphql/resolvers/inboxQueries';
import { reportTicketQueries } from '@/reports/graphql/resolvers/ticketQueries';
import ticketQueries from '@/ticket/graphql/resolvers/queries';
import { fieldQueries } from '~/modules/form/graphql/resolvers/queries/fields';
import formQueries from '~/modules/form/graphql/resolvers/queries/forms';
import { knowledgeBaseCpQueries } from '~/modules/knowledgebase/graphql/resolvers/queries/knowledgeBaseCpQueries';
import { responseTemplateQueries } from '~/modules/response/graphql/responseTemplateQueries';

export const queries = {
  ...channelQueries,
  ...conversationQueries,
  ...integrationQueries,
  ...facebookQueries,
  ...callQueries,
  ...imapQueries,
  ...ticketQueries,
  ...widgetQueries,
  ...responseTemplateQueries,
  ...formQueries,
  ...fieldQueries,
  ...reportInboxQueries,
  ...reportTicketQueries,
  ...knowledgeBaseQueries,
  ...knowledgeBaseCpQueries,
};
