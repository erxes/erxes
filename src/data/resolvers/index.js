import customScalars from './customScalars';
import Query from './queries';
import ResponseTemplate from './responseTemplate';
import Integration from './integration';
import Form from './form';
import EngageMessage from './Engage';
import Conversation from './Conversation';
import ConversationMessage from './ConversationMessage';

export default {
  ...customScalars,

  ResponseTemplate,
  Integration,
  Form,
  EngageMessage,
  Conversation,
  ConversationMessage,

  Query,
};
