import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, addMethodName, editMethodName, item) => {
  let methodName = `knowledgebase.${addMethodName}`;
  let params = { ...paramsDic };

  if (item && item._id) {
    methodName = `knowledgebase.${editMethodName}`;
    params = { _id: item._id, ...paramsDic };
  }

  Meteor.call(methodName, params, error => {
    if (error) {
      return Alert.error(error.reason);
    }

    Alert.success('Congrats');
    return FlowRouter.go('/settings/knowledgebase/', {}, FlowRouter.current().queryParams);
  });
};
