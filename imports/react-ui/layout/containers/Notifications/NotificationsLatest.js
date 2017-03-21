import { Meteor } from 'meteor/meteor';
import { Notifications } from 'meteor/erxes-notifications';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Spinner } from '/imports/react-ui/common';
import { NotificationsLatest } from '../../components';


function composer(props, onData) {
  const handler = Meteor.subscribe('notifications.latest', {
    limit: 10,
    requireRead: false,
  });

  if (handler.ready()) {
    const createdUserIds = [];

    const notifications = Notifications.find(
      {},
      { limit: 10, sort: { date: -1 } },
    );

    notifications.forEach((notification) => {
      createdUserIds.push(notification.createdUser);
    });

    Meteor.subscribe('users.list', { ids: createdUserIds });

    onData(null, { notifications: notifications.fetch() });
  }
}

export default compose(getTrackerLoader(composer), Spinner)(NotificationsLatest);
