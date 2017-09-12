import customScalars from './customScalars';
import Mutation from './mutations';
import Query from './queries';
import Subscription from './subscriptions';
import ResponseTemplate from './responseTemplate';
import Integration from './integration';
import Form from './form';
import EngageMessage from './Engage';
import Customer from './Customer';
import Segment from './Segment';
import Conversation from './Conversation';
import ConversationMessage from './ConversationMessage';

export default {
  ...customScalars,

  ResponseTemplate,
  Integration,
  Form,
  Customer,
  Segment,
  EngageMessage,
  Conversation,
  ConversationMessage,

  Mutation,
  Query,
  Subscription,
};
