import { composeWithTracker } from 'react-komposer';
import { changeStatus as method } from '/imports/api/conversations/methods';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { Resolver } from '../components';


function composer(props, onData) {
  const changeStatus = (args, callback) => {
    method.call(args, callback);
  };

  onData(null, {
    conversation: props.conversation,
    changeStatus,
    CONVERSATION_STATUSES,
  });
}

export default composeWithTracker(composer)(Resolver);
