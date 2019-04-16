import activityLogs from './activityLogs';
import conversations from './conversations';
import customers from './customers';
import pubsub from './pubsub';

export { pubsub };

let subscriptions: any = {
  ...conversations,
  ...customers,
  ...activityLogs,
};

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
if (NODE_ENV === 'test') {
  subscriptions = {};
}

export default subscriptions;
