import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Messages } from '/imports/api/engage/engage';
import { methodCallback } from '/imports/react-ui/engage/utils';
import { VisitorForm } from '../components';

function composer({ messageId }, onData) {
  const handler = Meteor.subscribe('engage.messages.detail', messageId || '');
  const usersHandler = Meteor.subscribe('users.list', {});

  // wait for detail subscription
  if (!handler.ready() || !usersHandler.ready()) {
    return null;
  }

  // save
  const save = doc => {
    if (messageId) {
      return Meteor.call('engage.messages.edit', { id: messageId, doc }, methodCallback);
    }

    return Meteor.call('engage.messages.add', { doc }, methodCallback);
  };

  // props
  const message = Messages.findOne({ _id: messageId });
  const users = Meteor.users.find({}).fetch();

  onData(null, { save, message, users });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(VisitorForm);
