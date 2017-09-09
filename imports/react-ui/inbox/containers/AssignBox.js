import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Conversations } from '/imports/api/conversations/conversations';
import { AssignBox } from '../components';

function composer(props, onData) {
  const assign = ({ targetIds, assignedUserId }, callback) => {
    const params = { conversationIds: targetIds, assignedUserId };

    Meteor.call('conversations.assign', params, (...params) => {
      callback(...params);
    });
  };

  const clear = (conversationIds, callback) => {
    Meteor.call('conversations.unassign', { conversationIds }, callback);
  };

  const targets = Conversations.find({ _id: { $in: props.targets } }).fetch();

  const usersHandle = Meteor.subscribe('users.list', {});

  if (usersHandle.ready()) {
    const assignees = Meteor.users.find().fetch();

    onData(null, {
      targets,
      assignees,
      assign,
      clear,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(AssignBox);
