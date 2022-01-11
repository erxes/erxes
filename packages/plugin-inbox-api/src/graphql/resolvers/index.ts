import customScalars from '@erxes/api-utils/src/customScalars';
import ConversationMutations from './conversationMutations';
import ResponseTemplateMutations from './responseTemplateMutations';
import { skillTypesMutations, skillsMutations } from './skillMutations';
import ConversationQueries from './conversationQueries';
import ChannelQueries from './channelQueries';
import IntegrationQueries from './integrationQueries';
import ResponseTemplateQueries from './responseTemplateQueries';
import { skillQueries, skillTypesQueries } from './skillQueries';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import Channel from './channel';
import ResponseTemplate from './responseTemplate';

const resolvers: any = {
  ...customScalars,
  Conversation,
  ConversationMessage,
  Channel,
  ResponseTemplate,
  Mutation: {
    ...ConversationMutations,
    ...ResponseTemplateMutations,
    ...skillTypesMutations,
    ...skillsMutations
  },
  Query: {
    ...ConversationQueries,
    ...IntegrationQueries,
    ...skillQueries,
    ...skillTypesQueries,
    ...ResponseTemplateQueries,
    ...ChannelQueries
  }
};

export default resolvers;