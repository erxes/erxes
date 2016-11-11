import { composeWithTracker } from 'react-komposer';
import { star, unstar } from '/imports/api/tickets/methods';
import { Starrer } from '../components';


function composer(props, onData) {
  const toggleStar = ({ starred, ticketIds }, callback) => {
    const method = starred ? star : unstar;
    method.call({ ticketIds }, callback);
  };

  onData(null, {
    ticket: props.ticket,
    toggleStar,
  });
}

export default composeWithTracker(composer)(Starrer);
