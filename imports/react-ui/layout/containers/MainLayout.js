import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Loader } from '/imports/react-ui/common';
import MainLayout from '../components/MainLayout.jsx';


function composer(props, onData) {
  onData(null, {
    userId: Meteor.userId(),
    loggingIn: Meteor.loggingIn(),
  });
}

export default compose(getTrackerLoader(composer, Loader))(MainLayout);
