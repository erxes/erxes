import pubsub from './pubsub';
import conversations from './conversations';
import customers from './customers';

export { pubsub };

let subscriptions = {
  ...conversations,
  ...customers,
};

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
if (NODE_ENV === 'test') {
  subscriptions = {};
}

export default subscriptions;
