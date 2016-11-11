import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Channels } from '/imports/api/channels/channels';
import { remove } from '/imports/api/channels/methods';
import { Loader } from '/imports/react-ui/common';
import { ChannelList } from '../components';


function composer(props, onData) {
  Meteor.subscribe('channels.list', props.queryParams);

  const channels = Channels.find({ memberIds: Meteor.userId() }).fetch();

  const removeChannel = (id, callback) => {
    remove.call(id, callback);
  };

  onData(null, { channels, removeChannel });
}

export default composeWithTracker(composer, Loader)(ChannelList);
