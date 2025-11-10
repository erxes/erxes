import { channelQueries } from '@/channel/graphql/resolvers/queries/channel';
import { conversationQueries } from '@/inbox/graphql/resolvers/queries/conversations';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { facebookQueries } from '@/integrations/facebook/graphql/resolvers/queries';
import callQueries from '@/integrations/call/graphql/resolvers/queries';
import { imapQueries } from '@/integrations/imap/graphql/resolvers/queries';
import { widgetQueries } from '@/inbox/graphql/resolvers/queries/widget';
import { pipelineQueries } from '@/ticket/graphql/resolvers/queries/Pipeline';
import { statusQueries } from '@/ticket/graphql/resolvers/queries/Status';
import { ticketQueries } from '@/ticket/graphql/resolvers/queries/Ticket';
import { activityQueries } from '@/ticket/graphql/resolvers/queries/Activity';
import { noteQueries } from '@/ticket/graphql/resolvers/queries/Note';

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
};
