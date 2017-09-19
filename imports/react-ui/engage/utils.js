import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';
import { notify } from '/imports/react-ui/apollo-client';

export const methodCallback = (error, response) => {
  if (error) {
    return Alert.error(error.reason || error.message);
  }

  Alert.success('Form is successfully saved.');

  // notify apollo server that new message arrived
  if (response.method === 'messenger' && notify) {
    notify();
  }

  FlowRouter.go('/engage');
};
