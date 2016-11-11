import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Notifications, Configs } from '../notifications';

Meteor.methods({
  ['notifications.markAsRead'](ids) {
    check(ids, [String]);

    Notifications.update(
      { _id: { $in: ids } },
      { $set: { isRead: true } },
      { multi: true }
    );
  },

  ['notifications.getModules']() {
    return Notifications.Modules;
  },

  ['notifications.saveConfig'](notifType, isAllowed) {
    check(notifType, String);
    check(isAllowed, Boolean);

    const selector = { user: this.userId, notifType };

    const oldOne = Configs.findOne(selector);

    // if already inserted then update isAllowed field
    if (oldOne) {
      Configs.update({ _id: oldOne._id }, { $set: { isAllowed } });

    // if it is first time then insert
    } else {
      selector.isAllowed = isAllowed;
      Configs.insert(selector);
    }
  },
});
