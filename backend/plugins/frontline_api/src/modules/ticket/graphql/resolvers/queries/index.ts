import { noteQueries } from '@/ticket/graphql/resolvers/queries/note';
import { pipelineQueries } from '@/ticket/graphql/resolvers/queries/pipeline';
import { statusQueries } from '@/ticket/graphql/resolvers/queries/status';
import { ticketQueries } from '@/ticket/graphql/resolvers/queries/ticket';
import { activityQueries } from '@/ticket/graphql/resolvers/queries/activity';
import { ticketConfigQueries } from '@/ticket/graphql/resolvers/queries/ticketConfig';
import { cpTicketQueries } from '@/ticket/graphql/resolvers/queries/clientPortal';

export default {
  ...pipelineQueries,
  ...statusQueries,
  ...ticketQueries,
  ...noteQueries,
  ...activityQueries,
  ...ticketConfigQueries,
  ...cpTicketQueries,
};
