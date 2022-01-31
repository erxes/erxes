import importHistory from './importHistory';
import robot from './robot';
import users from './users';

let subscriptions: any = {
  ...importHistory,
  ...robot,
  ...users
};

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
if (NODE_ENV === 'test') {
  subscriptions = {};
}

export default subscriptions;
