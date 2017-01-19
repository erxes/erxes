import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { assign as assignMethod, unassign } from '/imports/api/conversations/methods';
import { Conversations } from '/imports/api/conversations/conversations';
import { Spinner } from '/imports/react-ui/common';
import { AssignBox } from '../components';


function composer(props, onData) {
  const assign = ({ targetIds, assignedUserId }, callback) => {
    assignMethod.call({ conversationIds: targetIds, assignedUserId }, callback);
  };

  const clear = (conversationIds, callback) => {
    unassign.call({ conversationIds }, callback);
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

export default composeWithTracker(composer, Spinner)(AssignBox);
