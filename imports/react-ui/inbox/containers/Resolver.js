import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { Resolver } from '../components';


function composer(props, onData) {
  const changeStatus = (args, callback) => {
    Meteor.call('conversations.changeStatus', args, callback);
  };

  onData(null, {
    conversation: props.conversation,
    changeStatus,
    CONVERSATION_STATUSES,
  });
}

export default composeWithTracker(composer)(Resolver);
