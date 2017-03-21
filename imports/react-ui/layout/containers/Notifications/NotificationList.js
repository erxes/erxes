import { Meteor } from 'meteor/meteor';
import { Notifications } from 'meteor/erxes-notifications';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Loader, pagination } from '/imports/react-ui/common';
import { NotificationList } from '../../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(
    queryParams,
    'notifications.list.count',
  );

  const handler = Meteor.subscribe('notifications.latest', {
    limit,
    requireRead: false,
  });

  const markAsRead = (ids, callback) => {
    Meteor.call('notifications.markAsRead', ids, callback);
  };

  if (handler.ready()) {
    const createdUserIds = [];
    const notifications = Notifications.find({}, { sort: { date: -1 } }).fetch();

    notifications.forEach((notification) => {
      createdUserIds.push(notification.createdUser);
    });

    Meteor.subscribe('users.list', { ids: createdUserIds });

    onData(null, { notifications, markAsRead, loadMore, hasMore });
  }
}

export default compose(getTrackerLoader(composer), Loader)(NotificationList);
