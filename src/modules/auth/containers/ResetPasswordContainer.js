import { Accounts } from 'meteor/accounts-base';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { ResetPassword } from '../components';

function composer(props, onData) {
  onData(null, { resetPassword: Accounts.resetPassword });
}

export default compose(getTrackerLoader(composer))(ResetPassword);
