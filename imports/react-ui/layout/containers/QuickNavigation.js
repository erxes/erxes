import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Loader } from '/imports/react-ui/common';
import QuickNavigation from '../components/QuickNavigation.jsx';


function composer(props, onData) {
  const handler = Meteor.subscribe('notifications.unreadCount');

  if (handler.ready()) {
    const unreadCount = Counts.get('ureadNotificationsCount');
    onData(null, { unreadCount });
  }
}

export default compose(getTrackerLoader(composer, Loader))(QuickNavigation);
