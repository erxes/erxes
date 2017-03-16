import { Accounts } from 'meteor/accounts-base';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { SignUp } from '../components';


function composer(props, onData) {
  const createUser = Accounts.createUser;

  onData(null, { createUser });
}

export default compose(getTrackerLoader(composer))(SignUp);
