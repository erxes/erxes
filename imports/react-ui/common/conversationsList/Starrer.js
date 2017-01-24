import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Starrer from './Starrer.jsx';


function composer(props, onData) {
  const toggleStar = ({ starred, conversationIds }, callback) => {
    const methodName = starred ? 'star' : 'unstar';
    Meteor.call(`conversations.${methodName}`, { conversationIds }, callback);
  };

  onData(null, {
    conversation: props.conversation,
    toggleStar,
  });
}

export default composeWithTracker(composer)(Starrer);
