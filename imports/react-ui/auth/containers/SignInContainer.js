import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { SignIn } from '../components';


function composer(props, onData) {
  const loginWithPassword = Meteor.loginWithPassword;

  onData(null, { loginWithPassword });
}

export default composeWithTracker(composer)(SignIn);
