import { cpTicketMutations } from '@/ticket/graphql/resolvers/mutations/clientPortal';
import { noteMutations } from '@/ticket/graphql/resolvers/mutations/note';
import { pipelineMutations } from '@/ticket/graphql/resolvers/mutations/pipeline';
import { statusMutations } from '@/ticket/graphql/resolvers/mutations/status';
import { ticketMutations } from '@/ticket/graphql/resolvers/mutations/ticket';
import { ticketConfigMutations } from '@/ticket/graphql/resolvers/mutations/ticketConfig';

export default {
  ...pipelineMutations,
  ...statusMutations,
  ...ticketMutations,
  ...noteMutations,
  ...ticketConfigMutations,
  ...cpTicketMutations,
};
