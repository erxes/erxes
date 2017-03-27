import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Profile } from '../components';


function composer(props, onData) {
  const user = Meteor.user();

  if (!user) {
    return;
  }

  // save profile action
  const save = (doc, callback) => {
    Meteor.call('users.editProfile', doc, callback);
  };

  onData(null, { user, save });
}

export default compose(getTrackerLoader(composer))(Profile);
