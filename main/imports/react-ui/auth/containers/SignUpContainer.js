import { Accounts } from 'meteor/accounts-base';
import { composeWithTracker } from 'react-komposer';
import { SignUp } from '../components';


function composer(props, onData) {
  const createUser = Accounts.createUser;

  onData(null, { createUser });
}

export default composeWithTracker(composer)(SignUp);
