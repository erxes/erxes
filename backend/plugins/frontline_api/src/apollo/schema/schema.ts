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
  mutations as DiscordMutations,
  queries as DiscordQueries,
  types as DiscordTypes,
} from '@/integrations/discord/graphql/schema/discord';

import {
  mutations as InstagramMutations,
  queries as InstagramQueries,
  types as InstagramTypes,
} from '@/integrations/instagram/graphql/schema/instagram';

import {
  mutations as CallMutations,
  queries as CallQueries,
  types as CallTypes,
} from '@/integrations/call/graphql/schema/call';

import {
  mutations as CallProMutations,
  queries as CallProQueries,
  types as CallProTypes,
} from '@/integrations/callpro/graphql/schema';

import {
  mutations as MailMutations,
  queries as MailQueries,
  types as MailTypes,
} from '@/integrations/mail/graphql/schema/mail';

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
  mutations as PollMutations,
  queries as PollQueries,
  types as PollTypes,
} from '~/modules/poll/graphql/schema/poll';

import {
  queries as ReportCallQueries,
  types as ReportCallTypes,
} from '@/reports/graphql/schema/call';

import {
  queries as ReportInboxQueries,
  types as ReportInboxTypes,
} from '@/reports/graphql/schema/inbox';

import {
  queries as ReportTicketQueries,
  types as ReportTicketTypes,
} from '@/reports/graphql/schema/ticket';

import {
  mutations as ReportFacebookMutations,
  queries as ReportFacebookQueries,
  types as ReportFacebookTypes,
} from '@/reports/graphql/schema/facebook';

import {
  mutations as ReportChartMutations,
  queries as ReportChartQueries,
  types as ReportChartTypes,
} from '@/reports/graphql/schema/chart';

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

import {
  queries as CpInboxQueries,
  mutations as CpInboxMutations,
  subscriptions as CpInboxSubscriptions,
} from '~/modules/inbox/graphql/schemas/clientPortal';

export const types = `
    ${ChannelsTypes}
    ${ConversationsTypes}
    ${IntegrationsTypes}
    ${FacebookTypes}
    ${DiscordTypes}
    ${InstagramTypes}
    ${CallTypes}
    ${CallProTypes}
    ${MailTypes}
    ${TicketTypes}
    ${WidgetTypes}
    ${ResponseTemplateTypes}
    ${ReportCallTypes}
    ${ReportInboxTypes}
    ${ReportTicketTypes}
    ${ReportFacebookTypes}
    ${ReportChartTypes}
    ${FormTypes}
    ${FieldTypes}
    ${PollTypes}
    ${KnowledgeBaseTypes}
  `;

export const queries = `
    ${ChannelsQueries}
    ${ConversationsQueries}
    ${IntegrationsQueries}
    ${FacebookQueries}
    ${DiscordQueries}
    ${InstagramQueries}
    ${CallQueries}
    ${CallProQueries}
    ${MailQueries}
    ${TicketQuery}
    ${WidgetQueries}
    ${ResponseTemplateQueries}
    ${ReportCallQueries}
    ${ReportInboxQueries}
    ${ReportTicketQueries}
    ${ReportFacebookQueries}
    ${ReportChartQueries}
    ${FormQueries}
    ${FieldQueries}
    ${PollQueries}
    ${KnowledgeBaseQueries}
    ${CpInboxQueries}
  `;

export const mutations = `
   ${ChannelsMutations}
   ${ConversationsMutations}
   ${IntegrationsMutations}
   ${FacebookMutations}
   ${DiscordMutations}
   ${InstagramMutations}
   ${CallMutations}
   ${CallProMutations}
   ${MailMutations}
   ${TicketMutations}
   ${WidgetMutations}
   ${ResponseTemplateMutations}
   ${FormMutations}
   ${FieldMutations}
   ${PollMutations}
   ${KnowledgeBaseMutations}
   ${CpInboxMutations}
   ${ReportChartMutations}
   ${ReportFacebookMutations}
`;

export default { types, queries, mutations };
