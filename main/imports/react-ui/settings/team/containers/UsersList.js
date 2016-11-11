import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import { Loader } from '/imports/react-ui/common';
import { Channels } from '/imports/api/channels/channels';
import { UsersList } from '../components';

function composer(props, onData) {
  const usersHandle = Meteor.subscribe('users.list', props.queryParams);
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

    onData(null, { users, channels, inviteMember, deactivate, updateInvitationInfos });
  }
}

export default composeWithTracker(composer, Loader)(UsersList);
