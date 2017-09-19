import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';

export const saveCallback = (paramsDic, methodName, redirectPath) => {
  const kbMethodName = `KnowledgeBaseArticles.${methodName}`;
  Meteor.call(kbMethodName, paramsDic, error => {
    if (error) {
      return Alert.error(error.reason);
    }
    Alert.success('Congrats');
    return FlowRouter.go(redirectPath, {}, FlowRouter.current().queryParams);
  });
};
