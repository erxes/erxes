import { composeWithTracker } from 'react-komposer';
import { addMessage } from '/imports/api/conversations/methods';
import { newMessage } from '/imports/react-ui/apollo-client';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { RespondBox } from '../components';

function composer(props, onData) {
  const sendMessage = (message, callback) => {
    const cb = (error, messageId) => {
      const integration = props.conversation.integration();

      // if conversation is in app messaging then notify graphql subscription
      // server that new message inserted
      if (!error && integration.kind === KIND_CHOICES.IN_APP_MESSAGING) {
        newMessage(messageId);
      }

      callback(error, messageId);
    };

    addMessage.call(message, cb);
  };

  onData(null, {
    conversation: props.conversation,
    sendMessage,
  });
}

export default composeWithTracker(composer)(RespondBox);
