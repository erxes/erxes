import { combineReducers } from 'redux';

import chat from './chat';
import user from './user';
import customer from './customer';
import notifs from './notifs';


const erxesApp = combineReducers({
  chat,
  users: user,
  customers: customer,
  notifs,
});

export default erxesApp;
