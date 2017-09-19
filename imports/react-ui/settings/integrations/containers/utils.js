import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, addMethodName, editMethodName, integration, refetch) => {
  let methodName = `integrations.${addMethodName}`;
  let params = { ...paramsDic };

  if (integration && integration._id) {
    methodName = `integrations.${editMethodName}`;
    params = { _id: integration._id, ...paramsDic };
  }

  Meteor.call(methodName, params, error => {
    if (error) {
      return Alert.error(error.reason);
    }

    if (refetch) {
      refetch();
    }

    Alert.success('Congrats');

    return FlowRouter.go('/settings/integrations/list', {}, FlowRouter.current().queryParams);
  });
};
