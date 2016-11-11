import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Tickets } from '/imports/api/tickets/tickets';
import { Comments } from '/imports/api/tickets/comments';
import TicketDetail from '../components/TicketDetail.jsx';


function composer(props, onData) {
  const { id } = props;
  const subHandle = Meteor.subscribe('tickets.detail', id);
  const commentSubHandle = Meteor.subscribe('tickets.commentList', id);

  if (subHandle.ready() && commentSubHandle.ready()) {
    const ticket = Tickets.findOne(id);
    const comments = Comments.find({ ticketId: id }).fetch();

    onData(null, { ticket, comments });
  }
}

export default composeWithTracker(composer)(TicketDetail);
