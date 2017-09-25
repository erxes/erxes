import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import QuickNavigation from '../components/QuickNavigation';

function composer(props, onData) {
  const handler = Meteor.subscribe('notifications.unreadCount');

  if (handler.ready()) {
    const unreadCount = 0;
    onData(null, { unreadCount });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(QuickNavigation);
