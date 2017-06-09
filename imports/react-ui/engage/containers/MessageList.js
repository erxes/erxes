import { Meteor } from 'meteor/meteor';
import Alert from 'meteor/erxes-notifier';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { MessageList } from '../components';

function composer({ type }, onData) {
  const messagesHandler = Meteor.subscribe('engage.messages.list', { type });
  Meteor.subscribe('users.list', {});
  Meteor.subscribe('customers.segments');

  const remove = messageId => {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    Meteor.call('engage.messages.remove', messageId, error => {
      if (error) {
        return Alert.error("Can't delete a message", error.reason);
      }

      return Alert.success('Congrats', 'Message has deleted.');
    });
  };

  if (messagesHandler.ready()) {
    onData(null, {
      type,
      messages: Messages.find().fetch(),
      remove,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageList);
