import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import Starrer from './Starrer';

function composer(props, onData) {
  const toggleStar = ({ starred, conversationIds }, callback) => {
    const methodName = starred ? 'star' : 'unstar';
    Meteor.call(`conversations.${methodName}`, { conversationIds }, callback);
  };

  onData(null, {
    conversation: props.conversation,
    toggleStar,
  });
}

export default compose(getTrackerLoader(composer))(Starrer);
