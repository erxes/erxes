import customScalars from '@erxes/api-utils/src/customScalars';
import ConversationMutations from './conversationMutations';
import ConversationQueries from './conversationQueries';
import ChannelQueries from './channelQueries';
import IntegrationQueries from './integrationQueries';
import MessengerAppQueries from './messengerAppQueries';
import ChannelMutations from './channelMutations';
import IntegrationMutations from './integrationMutations';
import ResponseTempateMutations from './responseTempateMutations';
import MessengerAppMutations from './messengerAppMutations';
import WidgetMutations from './widgetMutations';
import { skillTypesMutations, skillsMutations } from './skillMutations';
import { skillTypesQueries, skillQueries } from './skillQueries';
import WidgetQueries from './widgetQueries';
import Conversation from './conversation';
import Channel from './channel';
import Integration from './integration';
import ConversationMessage from './conversationMessage';

const resolvers: any = {
  ...customScalars,
  Conversation,
  Channel,
  Integration,
  ConversationMessage,
  Mutation: {
    ...ConversationMutations,
    ...IntegrationMutations,
    ...ChannelMutations,
    ...ResponseTempateMutations,
    ...skillTypesMutations,
    ...skillsMutations,
    ...WidgetMutations,
    ...MessengerAppMutations
  },
  Query: {
    ...ChannelQueries,
    ...MessengerAppQueries,
    ...IntegrationQueries,
    ...skillTypesQueries,
    ...skillQueries,
    ...WidgetQueries,
    ...ConversationQueries
  }
};

export default resolvers;