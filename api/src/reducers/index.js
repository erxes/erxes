import { combineReducers } from 'redux';

import chat from './chat';
import user from './user';
import customer from './customer';


const erxesApp = combineReducers({
  chat,
  users: user,
  customers: customer,
});

export default erxesApp;
