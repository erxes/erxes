import { Meteor } from 'meteor/meteor';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { MessageListRow } from '../components';

function composer({ message, refetch }, onData) {
  const messageId = message._id;

  const edit = () => {
    FlowRouter.go(`/engage/messages/edit/${messageId}`);
  };

  const remove = () => {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    Meteor.call('engage.messages.remove', messageId, error => {
      if (error) {
        return Alert.error("Can't delete a message", error.reason);
      }

      refetch();

      return Alert.success('Congrats', 'Message has deleted.');
    });
  };

  const setLive = () => {
    Meteor.call('engage.messages.setLive', messageId, () => {
      refetch();
      return Alert.success('Live');
    });
  };

  const setLiveManual = () => {
    Meteor.call('engage.messages.setLiveManual', messageId, () => {
      refetch();
      return Alert.success('Live');
    });
  };

  const setPause = () => {
    Meteor.call('engage.messages.setPause', messageId, () => {
      refetch();
      return Alert.success('Paused');
    });
  };

  onData(null, {
    edit,
    remove,
    setLive,
    setLiveManual,
    setPause,
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MessageListRow);
