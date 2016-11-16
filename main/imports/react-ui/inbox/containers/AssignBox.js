import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { assign as assignMethod, unassign } from '/imports/api/conversations/methods';
import { AssignBox } from '../components';


function composer(props, onData) {
  const assign = (conversationIds, assignedUserId, callback) => {
    assignMethod.call({ conversationIds, assignedUserId }, callback);
  };

  const clear = (conversationIds, callback) => {
    unassign.call({ conversationIds }, callback);
  };

  onData(null, {
    conversation: props.conversation,
    assignees: Meteor.users.find().fetch(),
    assign,
    clear,
  });
}

export default composeWithTracker(composer)(AssignBox);
