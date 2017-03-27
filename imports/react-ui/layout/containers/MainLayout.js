import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import MainLayout from '../components/MainLayout.jsx';


function composer(props, onData) {
  onData(null, {
    userId: Meteor.userId(),
    loggingIn: Meteor.loggingIn(),
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(MainLayout);
