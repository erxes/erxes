import { Accounts } from 'meteor/accounts-base';
import { composeWithTracker } from 'react-komposer';
import { ResetPassword } from '../components';


function composer(props, onData) {
  onData(null, { resetPassword: Accounts.resetPassword });
}

export default composeWithTracker(composer)(ResetPassword);
