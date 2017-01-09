import { Meteor } from 'meteor/meteor';
import { Notifications } from 'meteor/erxes-notifications';
import { composeWithTracker } from 'react-komposer';
import { NotificationList } from '../../components';
import { Loader, pagination } from '/imports/react-ui/common';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'notifications.list.count');
  const handler = Meteor.subscribe('notifications.latest', {
    limit,
    requireRead: false,
  });

  const markAsRead = (ids, callback) => {
    Meteor.call('notifications.markAsRead', ids, callback);
  };

  if (handler.ready()) {
    const createdUserIds = [];
    const notifications = Notifications.find().fetch();

    notifications.map((notification) =>
      createdUserIds.push(notification.createdUser)
    );

    Meteor.subscribe('users.list', { ids: createdUserIds });

    onData(null, { notifications, markAsRead, loadMore, hasMore });
  }
}

export default composeWithTracker(composer, Loader)(NotificationList);
