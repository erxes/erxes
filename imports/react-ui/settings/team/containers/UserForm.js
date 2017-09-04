import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Channels } from '/imports/api/channels/channels';
import { UserForm } from '../components';

function composer({ object = {} }, onData) {
  const channelsHandle = Meteor.subscribe('channels.list', {});

  if (channelsHandle.ready()) {
    let selectedChannels = [];

    if (object._id) {
      selectedChannels = Channels.find({ memberIds: object._id }).fetch();
    }

    const channels = Channels.find({}).fetch();

    onData(null, { selectedChannels, channels });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({ spinner: true }))(UserForm);
