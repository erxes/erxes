import robot from './robot';
import users from './users';

const { NODE_ENV } = process.env;

// disable subscriptions in test mode
const subscriptions: any = NODE_ENV === 'test' ? {} : {
  ...robot,
  ...users
};

export default subscriptions;
