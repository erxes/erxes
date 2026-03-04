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
  queries as WidgetQueries,
  types as WidgetTypes,
  mutations as WidgetMutations,
} from '~/modules/inbox/graphql/schemas/widget';

import {
  mutations as ResponseTemplateMutations,
  queries as ResponseTemplateQueries,
  types as ResponseTemplateTypes,
} from '~/modules/response/graphql/schema';
import {
  mutations as FormMutations,
  queries as FormQueries,
  types as FormTypes,
} from '~/modules/form/graphql/schema/form';

import {
  fieldsMutations as FieldMutations,
  fieldsQueries as FieldQueries,
  fieldsTypes as FieldTypes,
} from '~/modules/form/graphql/schema/field';

import {
  queries as ReportInboxQueries,
  types as ReportInboxTypes,
} from '@/reports/graphql/schema/inbox';

import {
  queries as ReportTicketQueries,
  types as ReportTicketTypes,
} from '@/reports/graphql/schema/ticket';

import {
  queries as KnowledgeBaseQueries,
  mutations as KnowledgeBaseMutations,
  types as KnowledgeBaseTypes,
} from '@/knowledgebase/graphql/schemas/knowledgeBaseTypeDefs';

import {
  mutations as TicketMutations,
  queries as TicketQuery,
  types as TicketTypes,
} from '@/ticket/graphql/schemas';

export const types = `
    ${ChannelsTypes}
    ${ConversationsTypes}
    ${IntegrationsTypes}
    ${FacebookTypes}
    ${CallTypes}
    ${ImapTypes}
    ${TicketTypes}
    ${WidgetTypes}
    ${ResponseTemplateTypes}
    ${ReportInboxTypes}
    ${ReportTicketTypes}
    ${FormTypes}
    ${FieldTypes}    ${KnowledgeBaseTypes}
  `;
export const queries = `
    ${ChannelsQueries}
    ${ConversationsQueries}
    ${IntegrationsQueries}
    ${FacebookQueries}
    ${CallQueries}
    ${ImapQueries}
    ${TicketQuery}
    ${WidgetQueries}
    ${ResponseTemplateQueries}
    ${ReportInboxQueries}
    ${ReportTicketQueries}
    ${FormQueries}
    ${FieldQueries}
    ${KnowledgeBaseQueries}
  `;

export const mutations = `
   ${ChannelsMutations}
   ${ConversationsMutations}
   ${IntegrationsMutations}
   ${FacebookMutations}
   ${CallMutations}
   ${ImapMutations}
   ${TicketMutations}
   ${WidgetMutations}
   ${ResponseTemplateMutations}
   ${FormMutations}
   ${FieldMutations}
   ${KnowledgeBaseMutations}
`;
export default { types, queries, mutations };
