import { Accounts } from 'meteor/accounts-base';
import { composeWithTracker } from 'react-komposer';
import { ForgotPassword } from '../components';


function composer(props, onData) {
  onData(null, { forgotPassword: Accounts.forgotPassword });
}

export default composeWithTracker(composer)(ForgotPassword);
