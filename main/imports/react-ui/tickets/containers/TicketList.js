import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Tickets } from '/imports/api/tickets/tickets';
import TicketList from '../components/TicketList.jsx';


function composer(props, onData) {
  const { channelId, queryParams } = props;
  const subHandle = Meteor.subscribe('tickets.list', { channelId, queryParams });

  if (subHandle.ready()) {
    const tickets = Tickets.find().fetch();

    onData(null, { tickets });
  }
}

export default composeWithTracker(composer)(TicketList);
