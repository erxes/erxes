import { Meteor } from 'meteor/meteor';
import { Notifications } from 'meteor/erxes-notifications';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { composeWithTracker } from 'react-komposer';
import { NotificationList } from '../../components';
import { Loader } from '/imports/react-ui/common';


function composer({ queryParams }, onData) {
  let hasMore = false;
  const NOTIFICATIONS_PER_PAGE = 10;
  const pageNumber = parseInt(queryParams.page, 10) || 1;
  const limit = NOTIFICATIONS_PER_PAGE * pageNumber;
  const notificationsCount = Counts.get('notifications.list.count');
  const handler = Meteor.subscribe('notifications.latest', {
    limit,
    requireRead: false,
  });

  const loadMore = () => {
    const params = { page: pageNumber + 1 };
    FlowRouter.setQueryParams(params);
  };

  if (notificationsCount > pageNumber * NOTIFICATIONS_PER_PAGE) {
    hasMore = true;
  }

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
