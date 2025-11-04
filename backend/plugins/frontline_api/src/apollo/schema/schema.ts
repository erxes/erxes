// import { TypeExtensions } from '../../modules/inbox/graphql/schemas/extensions';
import {
  mutations as ChannelsMutations,
  queries as ChannelsQueries,
  types as ChannelsTypes,
} from '@/channel/graphql/schemas/channel';

import {
  mutations as ConversationsMutations,
  queries as ConversationsQueries,
  types as ConversationsTypes,
} from '@/inbox/graphql/schemas/conversation';

import {
  mutations as IntegrationsMutations,
  queries as IntegrationsQueries,
  types as IntegrationsTypes,
} from '@/inbox/graphql/schemas/integration';

import {
  mutations as FacebookMutations,
  queries as FacebookQueries,
  types as FacebookTypes,
} from '@/integrations/facebook/graphql/schema/facebook';

import {
  mutations as CallMutations,
  queries as CallQueries,
  types as CallTypes,
} from '@/integrations/call/graphql/schema/call';

import {
  mutations as ImapMutations,
  queries as ImapQueries,
  types as ImapTypes,
} from '@/integrations/imap/graphql/schema/imap';

import {
  mutations as PipelineMutations,
  queries as PipelineQuery,
  types as PipelineTypes,
} from '@/ticket/graphql/schemas/pipeline';

import {
  mutations as StatusMutations,
  queries as StatusQuery,
  types as StatusTypes,
} from '@/ticket/graphql/schemas/status';
import {
  mutations as TicketMutations,
  queries as TicketQuery,
  types as TicketTypes,
} from '@/ticket/graphql/schemas/ticket';

import {
  queries as WidgetQueries,
  types as WidgetTypes,
  mutations as WidgetMutations,
} from '~/modules/inbox/graphql/schemas/widget';

export const types = `
    ${ChannelsTypes}
    ${ConversationsTypes}
    ${IntegrationsTypes}
    ${FacebookTypes}
    ${CallTypes}
    ${ImapTypes}
    ${PipelineTypes}
    ${StatusTypes}
    ${TicketTypes}
    ${WidgetTypes}
  `;
export const queries = `
    ${ChannelsQueries}
    ${ConversationsQueries}
    ${IntegrationsQueries}
    ${FacebookQueries}
    ${CallQueries}
    ${ImapQueries}
    ${PipelineQuery}
    ${StatusQuery}
    ${TicketQuery}
    ${WidgetQueries}
  `;

export const mutations = `
   ${ChannelsMutations}
   ${ConversationsMutations}
   ${IntegrationsMutations}
   ${FacebookMutations}
   ${CallMutations}
   ${ImapMutations}
   ${PipelineMutations}
   ${StatusMutations}
   ${TicketMutations}
   ${WidgetMutations}
`;
export default { types, queries, mutations };
