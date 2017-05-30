import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { messagesAdd, messagesEdit } from '/imports/api/engage/methods';
import { Messages } from '/imports/api/engage/engage';
import { MessageForm } from '../components';

function composer({ messageId }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId);

  // wait for detail subscription
  if (!handler.ready()) {
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

  onData(null, { save, message });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageForm);
