import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Loader } from '/imports/react-ui/common';
import { Channels } from '/imports/api/channels/channels';
import { UsersList } from '../components';

function composer({ queryParams }, onData) {
  let hasMore = false;
  const USERS_PER_PAGE = 10;
  const pageNumber = parseInt(queryParams.page, 10) || 1;
  const limit = USERS_PER_PAGE * pageNumber;
  const uParams = Object.assign({ limit }, queryParams);
  const usersCount = Counts.get('users.list.count');
  const usersHandle = Meteor.subscribe('users.list', uParams);
  const channelsHandle = Meteor.subscribe('channels.list', {});

  const users = Meteor.users.find().fetch();

  const loadMore = () => {
    const qParams = { page: pageNumber + 1 };
    FlowRouter.setQueryParams(qParams);
  };

  if (usersCount > pageNumber * USERS_PER_PAGE) {
    hasMore = true;
  }

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

    onData(
      null,
      {
        users,
        channels,
        inviteMember,
        deactivate,
        updateInvitationInfos,
        hasMore,
        loadMore,
      }
    );
  }
}

export default composeWithTracker(composer, Loader)(UsersList);
