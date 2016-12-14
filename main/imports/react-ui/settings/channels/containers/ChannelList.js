import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Channels } from '/imports/api/channels/channels';
import { remove } from '/imports/api/channels/methods';
import { Loader } from '/imports/react-ui/common';
import { ChannelList } from '../components';


function composer({ queryParams }, onData) {
  let hasMore = false;
  const CHANNELS_PER_PAGE = 10;
  const pageNumber = parseInt(queryParams.page, 10) || 1;
  const limit = CHANNELS_PER_PAGE * pageNumber;
  const params = Object.assign({ limit }, queryParams);
  const channelsCount = Counts.get('channels.list.count');
  Meteor.subscribe('channels.list', params);
  const channels = Channels.find({ memberIds: Meteor.userId() }).fetch();

  const loadMore = () => {
    const qParams = { page: pageNumber + 1 };
    FlowRouter.setQueryParams(qParams);
  };

  if (channelsCount > pageNumber * 2) {
    hasMore = true;
  }

  const removeChannel = (id, callback) => {
    remove.call(id, callback);
  };

  onData(null, { channels, removeChannel, loadMore, hasMore });
}

export default composeWithTracker(composer, Loader)(ChannelList);
