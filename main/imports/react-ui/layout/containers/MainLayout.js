import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import MainLayout from '../components/MainLayout.jsx';


function composer(props, onData) {
  onData(null, {
    userId: Meteor.userId(),
    loggingIn: Meteor.loggingIn(),
  });
}

export default composeWithTracker(composer)(MainLayout);
