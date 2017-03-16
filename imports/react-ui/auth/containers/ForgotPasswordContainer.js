import { Accounts } from 'meteor/accounts-base';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { ForgotPassword } from '../components';


function composer(props, onData) {
  onData(null, { forgotPassword: Accounts.forgotPassword });
}

export default compose(getTrackerLoader(composer))(ForgotPassword);
