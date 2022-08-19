import customScalars from '@erxes/api-utils/src/customScalars';
import ConversationMutations from './conversationMutations';
import ConversationQueries from './conversationQueries';
import ChannelQueries from './channelQueries';
import IntegrationQueries from './integrationQueries';
import MessengerAppQueries from './messengerAppQueries';
import ResponseTemplateQueries from './responseTemplateQueries'
import ChannelMutations from './channelMutations';
import IntegrationMutations from './integrationMutations';
import ResponseTemplateMutations from './responseTemplateMutations';
import MessengerAppMutations from './messengerAppMutations';
import WidgetMutations from './widgetMutations';
import { skillTypesMutations, skillsMutations } from './skillMutations';
import { skillTypesQueries, skillQueries } from './skillQueries';
import WidgetQueries from './widgetQueries';
import Conversation from './conversation';
import Channel from './channel';
import Integration from './integration';
import ConversationMessage from './conversationMessage';
import BookingData from './bookingData';
import Customer from './customer';
import Script from './script';
import ScriptMutations from './scriptMutations';
import ScriptQueries from './scriptQueries';

const resolvers: any = {
  ...customScalars,
  Conversation,
  Customer,
  Channel,
  Integration,
  ConversationMessage,
  BookingData,
  Script,
  Mutation: {
    ...ConversationMutations,
    ...IntegrationMutations,
    ...ChannelMutations,
    ...ResponseTemplateMutations,
    ...skillTypesMutations,
    ...skillsMutations,
    ...WidgetMutations,
    ...MessengerAppMutations,
    ...ScriptMutations
  },
  Query: {
    ...ChannelQueries,
    ...MessengerAppQueries,
    ...IntegrationQueries,
    ...skillTypesQueries,
    ...skillQueries,
    ...ResponseTemplateQueries,
    ...WidgetQueries,
    ...ConversationQueries,
    ...ScriptQueries
  }
};

export default resolvers;