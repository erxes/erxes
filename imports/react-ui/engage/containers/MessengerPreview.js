import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { MessengerPreview } from '../components';

function composer(props, onData) {
  const fromUserId = props.fromUser;
  const user = Meteor.users.findOne({ _id: fromUserId });

  onData(null, { user });
}

export default compose(getTrackerLoader(composer))(MessengerPreview);
