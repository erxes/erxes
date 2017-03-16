import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
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

export default compose(getTrackerLoader(composer))(Participate);
