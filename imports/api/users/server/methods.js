import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { sendEmail } from '/imports/api/server/utils';
import { ErxesMixin } from '/imports/api/utils';
import { Channels } from '/imports/api/channels/channels';
import { Customers } from '/imports/api/customers/customers';
import {
  CreateInvitationSchema,
  UpdateInvitationSchema,
  ProfileSchema,
  EmailSignaturesSchema,
} from '../schemas';

// ***************** helpers ******************* //

// update user's channels
const updateUserChannels = (channelIds, userId) => {
  // remove from previous channels
  Channels.update(
    { memberIds: { $in: [userId] } },
    { $pull: { memberIds: userId } },
    { multi: true },
  );

  // add to given channels
  Channels.update({ _id: { $in: channelIds } }, { $push: { memberIds: userId } }, { multi: true });
};

// update user's common infos
const updateUserCommonInfos = (userId, doc) => {
  const user = Meteor.users.findOne({
    _id: { $ne: userId },
    'details.twitterUsername': doc.twitterUsername,
  });

  // check twitterUsername duplication
  if (doc.twitterUsername && user) {
    throw new Meteor.Error('users.updateInfo.wrongTwitterUsername', 'Duplicated twitter username');
  }

  Meteor.users.update(userId, {
    $set: {
      username: doc.username,
      'details.twitterUsername': doc.twitterUsername,
      'details.avatar': doc.avatar,
      'details.fullName': doc.fullName,
      'details.position': doc.position,
      'emails.0.address': doc.email,
    },
  });
};

const checkPasswordConfirmation = (password, passwordConfirmation) => {
  if (password !== passwordConfirmation) {
    throw new Meteor.Error(
      'users.updateInfo.WrongPasswordConfirmation',
      'Wrong password confirmation',
    );
  }
};

// ***************** methods ******************* //

// create user and invite to given channels
export const invite = new ValidatedMethod({
  name: 'users.add',

  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, CreateInvitationSchema);
  },

  run({ doc }) {
    const {
      username,
      twitterUsername,
      avatar,
      position,
      fullName,
      email,
      role,
      channelIds,
      password,
      passwordConfirmation,
    } = doc;

    checkPasswordConfirmation(password, passwordConfirmation);

    // create user with given email and role
    const userId = Accounts.createUser({
      email,
      invite: true,
      details: { role },
    });

    // set new password
    Accounts.setPassword(userId, password);

    // set profile infos
    updateUserCommonInfos(userId, {
      twitterUsername,
      username,
      avatar,
      fullName,
      position,
      email,
    });

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
export const edit = new ValidatedMethod({
  name: 'users.edit',

  mixins: [ErxesMixin],

  validate({ id, doc }) {
    check(id, String);

    // check doc
    check(doc, UpdateInvitationSchema);
  },

  run({ id, doc }) {
    const {
      twitterUsername,
      position,
      username,
      avatar,
      fullName,
      email,
      role,
      channelIds,
      password,
      passwordConfirmation,
    } = doc;

    // update user channels channels
    updateUserChannels(channelIds, id);

    const user = Meteor.users.findOne(id);

    // change password
    if (doc.password) {
      checkPasswordConfirmation(password, passwordConfirmation);

      // set new password
      Accounts.setPassword(id, password);
    }

    // if user is not owner then update profile infos
    if (!user.isOwner) {
      updateUserCommonInfos(id, {
        username,
        twitterUsername,
        avatar,
        position,
        fullName,
        email,
      });

      // update role
      Meteor.users.update(id, { $set: { 'details.role': role } });
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
      throw new Meteor.Error('users.editProfile.invalidPassword', result.error.reason);
    }

    return updateUserCommonInfos(this.userId, doc);
  },
});

// remove user
export const remove = new ValidatedMethod({
  name: 'users.remove',
  mixins: [ErxesMixin],

  validate(userId) {
    check(userId, String);
  },

  run(userId) {
    const user = Meteor.users.findOne(userId);

    // can not delete owner
    if (user.isOwner) {
      throw new Meteor.Error('users.remove.canNotDeleteOwner', 'You cannot delete the owner.');
    }

    // if the user involved in any channel then can not delete this user
    if (Channels.find({ userId }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInChannel',
        'You cannot delete this user. This user belongs other channel.',
      );
    }

    if (Channels.find({ memberIds: { $in: [userId] } }).count() > 0) {
      throw new Meteor.Error(
        'users.remove.involvedInChannel',
        'You cannot delete this user. This user belongs other channel.',
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
    Meteor.users.update(this.userId, {
      $set: { 'details.getNotificationByEmail': isAllowed },
    });
  },
});

/**
 * Saves column selection config of customers list table
 * to the user's object
 */
export const configCustomerFields = new ValidatedMethod({
  name: 'users.configCustomerFields',
  mixins: [ErxesMixin],

  validate({ fields }) {
    check(fields, Array);

    // Check if the fields are correctly named
    const schemaFields = Customers.getPublicFields();
    fields.forEach(({ key }) => {
      const isCorrectField = schemaFields.find(f => f.key === key);
      if (!isCorrectField) {
        throw new Meteor.Error(
          'users.configs.wrongCsutomerField',
          'Wrong customer field declaration.',
        );
      }
    });
  },

  run({ fields }) {
    Meteor.users.update(this.userId, {
      $set: { 'configs.customerFields': fields },
    });
  },
});
