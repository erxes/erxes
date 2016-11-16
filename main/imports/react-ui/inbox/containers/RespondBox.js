import { composeWithTracker } from 'react-komposer';
import { addComment } from '/imports/api/conversations/methods';
import { RespondBox } from '../components';


function composer(props, onData) {
  const sendMessage = (message, callback) => {
    addComment.call(message, callback);
  };

  onData(null, {
    conversation: props.conversation,
    sendMessage,
  });
}

export default composeWithTracker(composer)(RespondBox);
