import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { Channels } from '/imports/api/channels/channels';
import { remove } from '/imports/api/channels/methods';
import { Loader, pagination } from '/imports/react-ui/common';
import { ChannelList } from '../components';


function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'channels.list.count');
  Meteor.subscribe('channels.list', Object.assign(queryParams, { limit }));
  const channels = Channels.find({ memberIds: Meteor.userId() }).fetch();

  const removeChannel = (id, callback) => {
    remove.call(id, callback);
  };

  onData(null, { channels, removeChannel, loadMore, hasMore });
}

export default compose(getTrackerLoader(composer), Loader)(ChannelList);
