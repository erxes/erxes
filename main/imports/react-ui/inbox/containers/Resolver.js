import { composeWithTracker } from 'react-komposer';
import { changeStatus as method } from '/imports/api/tickets/methods';
import { TICKET_STATUSES } from '/imports/api/tickets/constants';
import { Resolver } from '../components';


function composer(props, onData) {
  const changeStatus = (args, callback) => {
    method.call(args, callback);
  };

  onData(null, {
    ticket: props.ticket,
    changeStatus,
    TICKET_STATUSES,
  });
}

export default composeWithTracker(composer)(Resolver);
