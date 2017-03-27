import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';
import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Conversations } from '/imports/api/conversations/conversations';
import { pagination } from '/imports/react-ui/common';
import { List } from '../components';


const bulk = new ReactiveVar([]);

function composer({ channelId, queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(
    queryParams,
    'conversations.counts.list',
  );

  queryParams.limit = limit; // eslint-disable-line no-param-reassign

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
  const conversationHandle = Meteor.subscribe('conversations.list', queryParams);

  const starredConversationIds = user.details.starredConversationIds || [];

  const conversationSort = { sort: { createdAt: -1 } };

  // unread conversations
  const unreadConversations = Conversations.find(
    { readUserIds: { $nin: [user._id] } },
    conversationSort,
  ).fetch();

  // read conversations
  const readConversations = Conversations.find(
    { readUserIds: { $in: [user._id] } },
    conversationSort,
  ).fetch();

  // props
  onData(
    null,
    {
      bulk: bulk.get(),
      loadMore,
      hasMore,
      toggleBulk,
      emptyBulk,
      unreadConversations,
      readConversations,
      starredConversationIds,
      channelId,
      user,
      conversationReady: conversationHandle.ready(),
    },
  );
}

export default compose(getTrackerLoader(composer), composerOptions({}))(List);
