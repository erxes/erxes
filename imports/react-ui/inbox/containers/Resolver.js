import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
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

export default compose(getTrackerLoader(composer), composerOptions({}))(Resolver);
