import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Counts } from 'meteor/tmeasday:publish-counts';
import QuickNavigation from '../components/QuickNavigation';

function composer(props, onData) {
  const handler = Meteor.subscribe('notifications.unreadCount');

  if (handler.ready()) {
    const unreadCount = Counts.get('ureadNotificationsCount');
    onData(null, { unreadCount });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(QuickNavigation);
