import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, callMethod, redirectPath) => {
  callMethod.call(paramsDic, err => {
    if (err) {
      return Alert.error(err.reason);
    }
    Alert.success('Congrats');
    return FlowRouter.go(redirectPath, {}, FlowRouter.current().queryParams);
  });
};
