import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { NotificationListRow } from '../../components';

function composer(props, onData) {
  const markAsRead = id => {
    Meteor.call('notifications.markAsRead', [id]);
  };

  const createdUserId = props.notification.createdUser;
  const createdUser = Meteor.users.findOne({ _id: createdUserId });

  onData(null, { markAsRead, createdUser });
}

export default compose(getTrackerLoader(composer))(NotificationListRow);
