import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { composeWithTracker } from 'react-komposer';
import { Conversations } from '/imports/api/conversations/conversations';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';
import { Tags } from '/imports/api/tags/tags';
import { TAG_TYPES } from '/imports/api/tags/constants';
import { Loader } from '/imports/react-ui/common';
import { List } from '../components';


const bulk = new ReactiveVar([]);

function composer({ channelId, queryParams }, onData) {
  // actions ===========
  const toggleBulk = (conversation, toAdd) => {
    let entries = bulk.get();

    // remove old entry
    entries = _.without(entries, _.findWhere(entries, { _id: conversation._id }));

    if (toAdd) {
      entries.push(conversation);
    }

    bulk.set(entries);
  };
  
  const emptyBulk = () => {
    bulk.set([]);
  };

  // subscriptions ==================
  const user = Meteor.user();
  const userId = user._id;
  const params = channelId ? Object.assign({ channelId }, queryParams) : queryParams;

  const conversationHandle = Meteor.subscribe('conversations.list', params);

  // show only involved channels
  const channelHandle = Meteor.subscribe(
    'channels.list',
    { memberIds: [user._id] }
  );

  // show only available channels's related brands
  const brandHandle = Meteor.subscribe('brands.list.inChannels');

  const tagsHandle = Meteor.subscribe('tags.tagList', TAG_TYPES.CONVERSATION);

  const conversations = Conversations.find({}, { sort: { createdAt: -1 } }).fetch();
  const channels = Channels.find({}, { sort: { name: 1 } }).fetch();
  const brands = Brands.find({}, { sort: { name: 1 } }).fetch();

  const starredConversationIds = user.details.starredConversationIds || [];
  const tags = Tags.find({ type: TAG_TYPES.CONVERSATION }).fetch();

  if (conversationHandle.ready() && channelHandle.ready() &&
      tagsHandle.ready() && brandHandle.ready()) {
    // integrations subscription
    const integrationsHandle = Meteor.subscribe(
      'integrations.list',
      { brandIds: _.pluck(brands, '_id') }
    );

    if (integrationsHandle.ready()) {
      // props
      onData(
        null,
        {
          bulk: bulk.get(),
          toggleBulk,
          emptyBulk,
          conversations,
          channels,
          starredConversationIds,
          tags,
          channelId,
          brands,
          userId,
        }
      );
    }
  }
}

export default composeWithTracker(composer, Loader)(List);
