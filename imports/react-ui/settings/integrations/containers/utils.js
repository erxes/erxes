import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (doc, addMethodName, editMethodName, integration) => {
  let methodName = `integrations.${addMethodName}`;
  let params = { doc };

  if (integration) {
    methodName = `integrations.${editMethodName}`;
    params = { _id: integration._id, doc };
  }

  Meteor.call(methodName, params, (error) => {
    if (error) {
      return Alert.error(error.reason);
    }

    Alert.success('Congrats');
    return FlowRouter.go('/settings/integrations/list');
  });
};
