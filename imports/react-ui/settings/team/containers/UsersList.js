import { compose } from 'react-komposer';
import { getTrackerLoader, composerOptions } from '/imports/react-ui/utils';
import { Meteor } from 'meteor/meteor';
import { pagination } from '/imports/react-ui/common';
import { Channels } from '/imports/api/channels/channels';
import { UsersList } from '../components';

function composer({ queryParams }, onData) {
  const { limit, loadMore, hasMore } = pagination(queryParams, 'users.list.count');
  const usersHandle = Meteor.subscribe('users.list', Object.assign(queryParams, { limit }));
  const channelsHandle = Meteor.subscribe('channels.list', {});

  const users = Meteor.users.find().fetch();

  const deactivate = (userId, callback) => {
    Meteor.call('users.remove', { userId }, (...params) => {
      callback(...params);
    });
  };

  const updateInvitationInfos = (doc, callback) => {
    Meteor.call('users.updateInvitationInfos', doc, (...params) => {
      callback(...params);
    });
  };

  const inviteMember = (doc, callback) => {
    Meteor.call('users.invite', doc, callback);
  };

  if (usersHandle.ready() && channelsHandle.ready()) {
    const channels = Channels.find().fetch();

    onData(null, {
      users,
      channels,
      inviteMember,
      deactivate,
      updateInvitationInfos,
      hasMore,
      loadMore,
    });
  }
}

export default compose(getTrackerLoader(composer), composerOptions({}))(UsersList);
