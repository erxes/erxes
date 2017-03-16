import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import Alert from 'meteor/erxes-notifier';
import { ChangePassword } from '../components';


function composer(props, onData) {
  // save function
  const save = ({ currentPassword, newPassword, confirmation }) => {
    if (newPassword !== confirmation) {
      return Alert.error('Password didn\'t match');
    }

    return Accounts.changePassword(currentPassword, newPassword, (error) => {
      if (error) {
        return Alert.error(error.reason);
      }

      return Alert.success('Success');
    });
  };

  onData(null, { user: Meteor.user(), save });
}

export default compose(getTrackerLoader(composer))(ChangePassword);
