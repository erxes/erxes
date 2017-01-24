import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Participate from './Participate.jsx';


function composer(props, onData) {
  const toggleParticipate = ({ starred, conversationIds }, callback) => {
    Meteor.call('conversations.toggleParticipate', { conversationIds }, callback);
  };

  onData(null, {
    conversation: props.conversation,
    toggleParticipate,
  });
}

export default composeWithTracker(composer)(Participate);
