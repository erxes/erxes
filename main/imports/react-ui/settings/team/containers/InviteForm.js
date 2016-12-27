import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import { Channels } from '/imports/api/channels/channels';
import { Spinner } from '/imports/react-ui/common';
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

export default composeWithTracker(composer, Spinner)(InviteForm);
