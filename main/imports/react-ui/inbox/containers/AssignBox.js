import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { assign as assignMethod, unassign } from '/imports/api/tickets/methods';
import { AssignBox } from '../components';


function composer(props, onData) {
  const assign = (ticketIds, assignedUserId, callback) => {
    assignMethod.call({ ticketIds, assignedUserId }, callback);
  };

  const clear = (ticketIds, callback) => {
    unassign.call({ ticketIds }, callback);
  };

  onData(null, {
    ticket: props.ticket,
    assignees: Meteor.users.find().fetch(),
    assign,
    clear,
  });
}

export default composeWithTracker(composer)(AssignBox);
