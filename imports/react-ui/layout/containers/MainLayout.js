import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Loader } from '/imports/react-ui/common';
import MainLayout from '../components/MainLayout.jsx';


function composer(props, onData) {
  onData(null, {
    userId: Meteor.userId(),
    loggingIn: Meteor.loggingIn(),
  });
}

export default composeWithTracker(composer, Loader)(MainLayout);
