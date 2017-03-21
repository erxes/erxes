import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
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

export default compose(getTrackerLoader(composer))(AuthBox);
