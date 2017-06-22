import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { VisitorForm } from '../components';

function composer({ messageId, kind }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId || '');
  const usersHandler = Meteor.subscribe('users.list', {});

  // wait for detail subscription
  if (!handler.ready() || !usersHandler.ready()) {
    return null;
  }

  // callback
  const callback = error => {
    if (error) {
      Alert.error(error.reason || error.message);
    } else {
      Alert.success('Form is successfully saved.');
      FlowRouter.go('/engage');
    }
  };

  // save
  const save = doc => {
    if (messageId) {
      return Meteor.call('engage.messages.edit', { id: messageId, doc }, callback);
    }

    doc.kind = kind;

    return Meteor.call('engage.messages.add', { doc }, callback);
  };

  // props
  const message = Messages.findOne({ _id: messageId });
  const users = Meteor.users.find({}).fetch();

  onData(null, { save, message, users });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(VisitorForm);
