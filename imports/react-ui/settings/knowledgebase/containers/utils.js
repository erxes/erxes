import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, methodName, redirectPath, refetch) => {
  const kbMethodName = `knowledgebase.${methodName}`;
  Meteor.call(kbMethodName, paramsDic, error => {
    if (error) {
      return Alert.error(error.reason);
    }
    Alert.success('Congrats');
    refetch && refetch();
    return FlowRouter.go(redirectPath, {}, FlowRouter.current().queryParams);
  });
};
