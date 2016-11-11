import { composeWithTracker } from 'react-komposer';
import { addComment } from '/imports/api/tickets/methods';
import { RespondBox } from '../components';


function composer(props, onData) {
  const sendMessage = (message, callback) => {
    addComment.call(message, callback);
  };

  onData(null, {
    ticket: props.ticket,
    sendMessage,
  });
}

export default composeWithTracker(composer)(RespondBox);
