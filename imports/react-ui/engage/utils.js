import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const methodCallback = error => {
  if (error) {
    return Alert.error(error.reason || error.message);
  }

  Alert.success('Form is successfully saved.');

  return FlowRouter.go('/engage');
};
