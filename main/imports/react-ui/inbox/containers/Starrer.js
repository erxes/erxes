import { composeWithTracker } from 'react-komposer';
import { star, unstar } from '/imports/api/conversations/methods';
import { Starrer } from '../components';


function composer(props, onData) {
  const toggleStar = ({ starred, conversationIds }, callback) => {
    const method = starred ? star : unstar;
    method.call({ conversationIds }, callback);
  };

  onData(null, {
    conversation: props.conversation,
    toggleStar,
  });
}

export default composeWithTracker(composer)(Starrer);
