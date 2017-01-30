/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Notifications, Configs } from '../notifications';


// latest notifications list
Meteor.publish('notifications.latest', function notifs(params) {
  check(params, {
    limit: Match.Integer,
    requireRead: Boolean,
    title: Match.Optional(String),
  });

  const { limit, requireRead, title } = params;

  const filters = { receiver: this.userId };

  Counts.publish(
    this,
    'notifications.list.count',
    Notifications.find(),
    { noReady: true },
  );

  if (requireRead) {
    filters.isRead = false;
  }

  if (title) {
    filters.title = title;
  }

  return Notifications.find(filters, { sort: { date: -1 }, limit });
});


// unread count
Meteor.publish('notifications.unreadCount', function notifCount() {
  const cursor = Notifications.find({
    receiver: this.userId,
    isRead: false,
  });

  Counts.publish(this, 'ureadNotificationsCount', cursor);
});


// notifications config
Meteor.publish('notifications.configs', function notificationsConfig() {
  return Configs.find({
    user: this.userId,
  });
});
