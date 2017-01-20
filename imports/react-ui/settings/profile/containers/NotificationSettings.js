import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Configs } from 'meteor/erxes-notifications';
import { composeWithTracker } from 'react-komposer';
import { Loader } from '/imports/react-ui/common';
import { NotificationSettings } from '../components';


const modules = new ReactiveVar([]);

// fetch modules
Meteor.call('notifications.getModules', (error, result) => {
  modules.set(result);
});

function composer(props, onData) {
  const user = Meteor.user();

  const save = (...params) => {
    Meteor.call('notifications.saveConfig', ...params);
  };

  const configGetNotificationByEmail = (...params) => {
    Meteor.call('users.configGetNotificationByEmail', ...params);
  };

  // configs subscription
  const configsHandler = Meteor.subscribe('notifications.configs');

  if (user && configsHandler.ready()) {
    // previously saved values
    const configs = Configs.find().fetch();

    // default value is checked
    let getNotificationByEmail = user.details.getNotificationByEmail;

    if (getNotificationByEmail === undefined) {
      getNotificationByEmail = true;
    }

    onData(
      null,
      {
        modules: modules.get(),
        configs,
        save,

        // previously configured value
        getNotificationByEmail,

        // action
        configGetNotificationByEmail,
      },
    );
  }
}

export default composeWithTracker(composer, Loader)(NotificationSettings);
