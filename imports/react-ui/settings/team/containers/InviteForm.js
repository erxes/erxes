import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Channels } from '/imports/api/channels/channels';
import { InviteForm } from '../components';

function composer({ user }, onData) {
  const channelsHandle = Meteor.subscribe('channels.list', {});

  let selectedChannels = [];
  if (user._id) {
    selectedChannels = Channels.find({ memberIds: user._id }).fetch();
  }
  if (channelsHandle.ready()) {
    onData(null, { selectedChannels });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(InviteForm);
