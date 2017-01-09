import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


// collections
export const Notifications = new Mongo.Collection('notifications');
export const Configs = new Mongo.Collection('notifications_configs');

// schemas
Notifications.Schema = new SimpleSchema({
  notifType: {
    type: String,
    optional: true,
  },

  title: {
    type: String,
  },

  link: {
    type: String,
    optional: true,
  },

  content: {
    type: String,
  },

  createdUser: {
    type: String,
    optional: true,
  },

  receiver: {
    type: String,
  },
});


const BaseExtra = new SimpleSchema({
  date: {
    type: 'date',
  },

  isRead: {
    type: Boolean,
  },
});


Configs.Schema = new SimpleSchema({
  // to whom this config is related
  user: {
    type: String,
  },

  // which module's type it is. For example: indocuments
  notifType: {
    type: String,
  },

  isAllowed: {
    type: Boolean,
  },
});


// attach schemas
Notifications.attachSchema(Notifications.Schema);
Notifications.attachSchema(BaseExtra);
Configs.attachSchema(Configs.Schema);
