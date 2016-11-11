import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { NotificationListRow } from '../../components';


function composer(props, onData) {
  const markAsRead = (id) => {
    Meteor.call('notifications.markAsRead', [id]);
  };

  const createdUserId = props.notification.createdUser;
  const createdUser = Meteor.users.findOne({ _id: createdUserId });

  onData(null, { markAsRead, createdUser });
}

export default composeWithTracker(composer)(NotificationListRow);
