import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, addMethodName, editMethodName, integration) => {
  let methodName = `knowledgebase.${addMethodName}`;
  let params = { ...paramsDic };

  if (integration && integration._id) {
    methodName = `knowledgebase.${editMethodName}`;
    params = { _id: integration._id, ...paramsDic };
  }

  Meteor.call(methodName, params, error => {
    if (error) {
      return Alert.error(error.reason);
    }

    Alert.success('Congrats');
    return FlowRouter.go('/settings/knowledgebase/list', {}, FlowRouter.current().queryParams);
  });
};
