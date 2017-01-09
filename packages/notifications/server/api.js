import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Notifications, Configs } from '../notifications';

// will contain all type of notifications information then it will be filled dynamically
Notifications.Modules = [];

Notifications.registerModule = (module) => {
  const schema = {
    name: String,
    description: String,

    types: [
      { name: String, text: String },
    ],
  };

  check(module, schema);

  const prevModule = _.find(
    Notifications.Modules,
    (moduleInList) => moduleInList.name === module.name
  );

  // module name is already exists
  if (prevModule) {
    throw new Meteor.Error(`${module.name} notification module already exists`);
  }

  // notif type name is already exists

  let allNotifTypes = [];

  _.each(Notifications.Modules, (moduleInList) => {
    allNotifTypes = _.union(allNotifTypes, moduleInList.types);
  });

  const allNotifTypeNames = _.pluck(allNotifTypes, 'name');
  const typeNames = _.pluck(module.types, 'name');

  // module.types and allNotifTypes must be nothing in common
  if (!_.isEmpty(_.intersection(allNotifTypeNames, typeNames))) {
    throw new Meteor.Error(
      `Some items in ${typeNames.toString()} are already exists`
    );
  }

  Notifications.Modules.unshift(module);
};


Notifications.create = (_modifier) => {
  const modifier = _modifier;

  check(modifier, Notifications.Schema);

  // Setting auto values
  modifier.isRead = false;
  modifier.createdUser = modifier.createdUser || this.userId;
  modifier.date = new Date();

  // if receiver is configured to get this notification
  const config = Configs.findOne({
    user: modifier.receiver,
    notifType: modifier.notifType,
  });

  // receiver disabled this notification
  if (config && !config.isAllowed) {
    return 'error';
  }

  Notifications.insert(modifier);

  return 'ok';
};
