import { Meteor } from 'meteor/meteor';
import Alert from 'meteor/erxes-notifier';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { messagesRemove } from '/imports/api/engage/methods';
import { MessageList } from '../components';

function composer(params, onData) {
  const handler = Meteor.subscribe('engage.messages.list');
  Meteor.subscribe('users.list', {});

  const remove = messageId => {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    messagesRemove.call(messageId, error => {
      if (error) {
        return Alert.error("Can't delete a channel", error.reason);
      }

      return Alert.success('Congrats', 'Channel has deleted.');
    });
  };

  if (handler.ready()) {
    onData(null, {
      messages: Messages.find().fetch(),
      remove,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageList);
