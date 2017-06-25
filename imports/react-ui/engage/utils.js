import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';
import { notify } from '/imports/react-ui/apollo-client';

export const methodCallback = (error, { method }) => {
  if (error) {
    return Alert.error(error.reason || error.message);
  }

  Alert.success('Form is successfully saved.');

  // notify apollo server that new message arrived
  if (method === 'messenger') {
    notify();
  }

  return FlowRouter.go('/engage');
};
