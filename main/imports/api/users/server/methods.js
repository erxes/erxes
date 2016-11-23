/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

import { sendEmail } from '/imports/api/server/utils';
import { ErxesMixin } from '/imports/api/utils';
import { Channels } from '/imports/api/channels/channels';
import { Conversations } from '/imports/api/conversations/conversations';
import { CreateInvitationSchema, UpdateInvitationSchema } from '../schemas';
import { ProfileSchema, EmailSignaturesSchema } from '../schemas';


// ***************** helpers ******************* //

// update user's channels
const updateUserChannels = (channelIds, userId) => {
  // remove from previous channels
  Channels.update(
    { memberIds: { $in: [userId] } },
    { $pull: { memberIds: userId } },
    { multi: true }
  );

  // add to given channels
  Channels.update(
    { _id: { $in: channelIds } },
    { $push: { memberIds: userId } },
    { multi: true }
  );
};

// update user's common infos
const updateUserCommonInfos = (userId, doc) => {
  const user = Meteor.users.findOne({
    _id: { $ne: userId },
    'details.twitterUsername': doc.twitterUsername,
  });

  // check twitterUsername duplication
  if (user) {
    throw new Meteor.Error(
      'users.updateInfo.wrongTwitterUsername',
      'Duplicated twitter username'
    );
  }

  Meteor.users.update(
    userId,
    {
      $set: {
        username: doc.username,
        'details.twitterUsername': doc.twitterUsername,
        'details.avatar': doc.avatar,
        'details.fullName': doc.fullName,
        'emails.0.address': doc.email,
      },
    }
  );
};

const checkPasswordConfirmation = (password, passwordConfirmation) => {
  if (password !== passwordConfirmation) {
    throw new Meteor.Error(
      'users.updateInfo.WrongPasswordConfirmation',
      'Wrong password confirmation'
    );
  }
};


// ***************** methods ******************* //


// create user and invite to given channels
export const invite = new ValidatedMethod({
  name: 'users.invite',
  mixins: [ErxesMixin],
  validate: CreateInvitationSchema.validator(),

  run(doc) {
    const {
      username, twitterUsername, avatar, fullName, email, role, channelIds,
      password, passwordConfirmation,
    } = doc;

    checkPasswordConfirmation(password, passwordConfirmation);

    // create user with given email and role
    const userId = Accounts.createUser(
      {
        email,
        invite: true,
        details: { role },
      }
    );

    // set new password
    Accounts.setPassword(userId, password);

    // set profile infos
    updateUserCommonInfos(
      userId,
      { twitterUsername, username, avatar, fullName, email }
    );

    // add new user to channels
    updateUserChannels(channelIds, userId);

    // send email
    sendEmail({
      to: email,
      subject: 'Invitation info',
      template: {
        name: 'invitation',
        data: {
          username,
          password,
        },
      },
    });
  },
});


// update invitation info
export const updateInvitationInfos = new ValidatedMethod({
  name: 'users.updateInvitationInfos',
  mixins: [ErxesMixin],
  validate: UpdateInvitationSchema.validator(),

  run(doc) {
    const {
      userId, twitterUsername, username, avatar, fullName, email,
      role, channelIds, password, passwordConfirmation,
    } = doc;

    // update user channels channels
    updateUserChannels(channelIds, userId);

    const user = Meteor.users.findOne(userId);

    // change password
    if (doc.password) {
      checkPasswordConfirmation(password, passwordConfirmation);

      // set new password
      Accounts.setPassword(userId, password);
    }

    // if user is not owner then update profile infos
    if (!user.isOwner) {
      updateUserCommonInfos(
        userId,
        { username, twitterUsername, avatar, fullName, email }
      );

       // update role
      Meteor.users.update(userId, { $set: { 'details.role': role } });
    }
  },
});

// edit profile
export const editProfile = new ValidatedMethod({
  name: 'users.editProfile',
  mixins: [ErxesMixin],
  validate: ProfileSchema.validator(),

  run(doc) {
    // check password
    const result = Accounts._checkPassword(Meteor.user(), doc.currentPassword);

    if (result.error) {
      throw new Meteor.Error(
        'users.editProfile.invalidPassword',
        result.error.reason
      );
    }

    return updateUserCommonInfos(this.userId, doc);
  },
});


// remove user
export const remove = new ValidatedMethod({
  name: 'users.remove',
  mixins: [ErxesMixin],

  validate({ userId }) {
    check(userId, String);
  },

  run({ userId }) {
    const user = Meteor.users.findOne(userId);

    // can not delete owner
    if (user.isOwner) {
      throw new Meteor.Error(
        'users.remove.canNotDeleteOwner',
        'Can not delete owner'
      );
    }

    // if the user involved in any channel then can not delete this user
    if (Channels.find({ userId }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInChannel',
        'Involved in channel'
      );
    }

    if (Channels.find({ memberIds: { $in: [userId] } }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInChannel',
        'Involved in channel'
      );
    }

    // if the user involved in any conversation then can not delete this user
    if (Conversations.find({ assignedUserId: userId }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInConversation',
        'Involved in conversation'
      );
    }

    if (Conversations.find({ participatedUserIds: { $in: [userId] } }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInConversation',
        'Involved in conversation'
      );
    }

    // if there is no problem then delete it
    Meteor.users.remove({ _id: userId });
  },
});


export const configEmailSignature = new ValidatedMethod({
  name: 'users.configEmailSignature',
  mixins: [ErxesMixin],
  validate: EmailSignaturesSchema.validator(),

  run({ signatures }) {
    Meteor.users.update(this.userId, { $set: { emailSignatures: signatures } });
  },
});


// get notification by email config
export const configGetNotificationByEmail = new ValidatedMethod({
  name: 'users.configGetNotificationByEmail',
  mixins: [ErxesMixin],

  validate({ isAllowed }) {
    check(isAllowed, Boolean);
  },

  run({ isAllowed }) {
    Meteor.users.update(
      this.userId,
      { $set: { 'details.getNotificationByEmail': isAllowed } }
    );
  },
});
