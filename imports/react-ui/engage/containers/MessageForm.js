import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { messagesAdd, messagesEdit } from '/imports/api/engage/methods';
import Segments from '/imports/api/customers/segments';
import { Messages } from '/imports/api/engage/engage';
import { MessageForm } from '../components';

function composer({ messageId }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId || '');
  const segmentsHandle = Meteor.subscribe('customers.segments');

  // wait for detail subscription
  if (!handler.ready() || !segmentsHandle.ready()) {
    return null;
  }

  // callback
  const callback = error => {
    if (error) {
      Alert.error(error.reason || error.message);
    } else {
      Alert.success('Form is successfully saved.');
      FlowRouter.go('/engage/messages/list');
    }
  };

  // save
  const save = doc => {
    if (messageId) {
      return messagesEdit.call({ id: messageId, doc }, callback);
    }

    return messagesAdd.call({ doc }, callback);
  };

  // props
  const message = Messages.findOne({ _id: messageId });
  const segments = Segments.find({}).fetch();

  onData(null, { save, message, segments });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageForm);
