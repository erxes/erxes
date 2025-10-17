import { channelQueries } from '@/channel/graphql/resolvers/queries/channel';
import { conversationQueries } from '@/inbox/graphql/resolvers/queries/conversations';
import { integrationQueries } from '@/inbox/graphql/resolvers/queries/integrations';
import { facebookQueries } from '@/integrations/facebook/graphql/resolvers/queries';
import callQueries from '@/integrations/call/graphql/resolvers/queries';
import { imapQueries } from '@/integrations/imap/graphql/resolvers/queries';

import { pipelineQueries } from '@/ticket/graphql/resolvers/queries/Pipeline';
import { statusQueries } from '@/ticket/graphql/resolvers/queries/Status';
import { ticketQueries } from '@/ticket/graphql/resolvers/queries/Ticket';
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
};
