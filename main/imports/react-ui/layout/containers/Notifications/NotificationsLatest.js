import { Meteor } from 'meteor/meteor';
import { Notifications } from 'meteor/erxes-notifications';
import { composeWithTracker } from 'react-komposer';
import { NotificationsLatest } from '../../components';
import { Spinner } from '/imports/react-ui/common';


function composer(props, onData) {
  const handler = Meteor.subscribe('notifications.latest', {
    limit: 10,
    requireRead: false,
  });

  if (handler.ready()) {
    const createdUserIds = [];
    const notifications = Notifications.find({}, { limit: 10 }).fetch();

    notifications.map((notification) =>
      createdUserIds.push(notification.createdUser)
    );

    Meteor.subscribe('users.list', { ids: createdUserIds });

    onData(null, { notifications });
  }
}

export default composeWithTracker(composer, Spinner)(NotificationsLatest);
