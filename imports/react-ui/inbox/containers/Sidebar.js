import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { _ } from 'meteor/underscore';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';
import { Tags } from '/imports/api/tags/tags';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Sidebar } from '../components';

function composer({ channelId, queryParams }, onData) {
  const userId = Meteor.userId();

  // show only involved channels
  const channelsHandle = Meteor.subscribe('channels.list', {
    memberIds: [userId],
  });

  // show only available channels's related brands
  const brandHandle = Meteor.subscribe('brands.list.inChannels');

  const tagsHandle = Meteor.subscribe('tags.tagList', TAG_TYPES.CONVERSATION);

  // show only available channels's related brands
  const channels = Channels.find({}, { sort: { name: 1 } }).fetch();
  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  // integrations subscription
  Meteor.subscribe('integrations.list', { brandIds: _.pluck(brands, '_id') });

  const tags = Tags.find({ type: TAG_TYPES.CONVERSATION }).fetch();

  // props
  onData(null, {
    tags,
    channels,
    brands,
    channelsReady: channelsHandle.ready(),
    tagsReady: tagsHandle.ready(),
    brandsReady: brandHandle.ready(),
  });
}

export default compose(getTrackerLoader(composer), composerOptions({}))(Sidebar);
