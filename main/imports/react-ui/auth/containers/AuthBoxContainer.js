import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { AuthBox } from '../components';


function composer(props, onData) {
  const user = Meteor.user();
  const loggingIn = Meteor.loggingIn();
  const loginWithPassword = Meteor.loginWithPassword;
  const logout = Meteor.logout;

  onData(null, {
    user,
    loggingIn,
    loginWithPassword,
    logout,
  });
}

export default composeWithTracker(composer)(AuthBox);
