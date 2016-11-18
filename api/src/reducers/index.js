import { combineReducers } from 'redux';
import chat from './chat';
import user from './user';
import notifs from './notifs';


const erxesApp = combineReducers({
  chat,
  users: user,
  notifs,
});

export default erxesApp;
