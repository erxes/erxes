import { combineReducers } from 'redux';
import messenger from './messenger';
import user from './user';
import notifications from './notifications';


const erxesApp = combineReducers({
  messenger,
  users: user,
  notifications,
});

export default erxesApp;
