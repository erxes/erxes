import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { SignIn } from '../components';


function composer(props, onData) {
  const loginWithPassword = Meteor.loginWithPassword;

  onData(null, { loginWithPassword });
}

export default compose(getTrackerLoader(composer))(SignIn);
