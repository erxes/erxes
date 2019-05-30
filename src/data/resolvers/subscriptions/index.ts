import activityLogs from './activityLogs';
import conversations from './conversations';
import customers from './customers';
import importHistory from './importHistory';

let subscriptions: any = {
  ...conversations,
  ...customers,
  ...activityLogs,
  ...importHistory,
};

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
if (NODE_ENV === 'test') {
  subscriptions = {};
}

export default subscriptions;
