import { Channels, Users } from '../../../db/models';
import { IDetail, IEmailSignature, ILink, IUser, IUserDocument } from '../../../db/models/definitions/users';
import { requireAdmin, requireLogin } from '../../permissions';
import utils from '../../utils';

interface IUsersAdd extends IUser {
  channelIds?: string[];
  passwordConfirmation?: string;
}

interface IUsersEdit extends IUsersAdd {
  _id: string;
}

const userMutations = {
  /*
   * Login
   */
  login(_root, args: { email: string; password: string }) {
    return Users.login(args);
  },

  /*
   * Send forgot password email
   */
  async forgotPassword(_root, { email }: { email: string }) {
    const token = await Users.forgotPassword(email);

    // send email ==============
    const { MAIN_APP_DOMAIN } = process.env;

    const link = `${MAIN_APP_DOMAIN}/reset-password?token=${token}`;

    utils.sendEmail({
      toEmails: [email],
      title: 'Reset password',
      template: {
        name: 'resetPassword',
        data: {
          content: link,
        },
      },
    });

    return link;
  },

  /*
   * Reset password
   */
  resetPassword(_root, args: { token: string; newPassword: string }) {
    return Users.resetPassword(args);
  },

  /*
   * Change user password
   */
  usersChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { user }: { user: IUserDocument },
  ) {
    return Users.changePassword({ _id: user._id, ...args });
  },

  /*
   * Create new user
   */
  async usersAdd(_root, args: IUsersAdd) {
    const { username, password, passwordConfirmation, email, role, channelIds = [], details, links } = args;

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    const createdUser = await Users.createUser({
      username,
      password,
      email,
      role,
      details,
      links,
    });

    // add new user to channels
    await Channels.updateUserChannels(channelIds, createdUser._id);

    const toEmails = email ? [email] : [];

    // send email ================
    utils.sendEmail({
      toEmails,
      subject: 'Invitation info',
      template: {
        name: 'invitation',
        data: {
          username,
          password,
        },
      },
    });

    return createdUser;
  },

  /*
   * Update user
   */
  async usersEdit(_root, args: IUsersEdit) {
    const { _id, username, password, passwordConfirmation, email, role, channelIds = [], details, links } = args;

    if (password && password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    // TODO check isOwner
    const updatedUser = await Users.updateUser(_id, {
      username,
      password,
      email,
      role,
      details,
      links,
    });

    // add new user to channels
    await Channels.updateUserChannels(channelIds, _id);

    return updatedUser;
  },

  /*
   * Edit user profile
   */
  async usersEditProfile(
    _root,
    {
      username,
      email,
      password,
      details,
      links,
    }: {
      username: string;
      email: string;
      password: string;
      details: IDetail;
      links: ILink;
    },
    { user }: { user: IUserDocument },
  ) {
    const userOnDb = await Users.findOne({ _id: user._id });

    if (!userOnDb) {
      throw new Error('User not found');
    }

    const valid = await Users.comparePassword(password, userOnDb.password);

    if (!password || !valid) {
      // bad password
      throw new Error('Invalid password');
    }

    return Users.editProfile(user._id, { username, email, details, links });
  },

  /*
   * Remove user
   */
  async usersRemove(_root, { _id }: { _id: string }) {
    const userToRemove = await Users.findOne({ _id });

    if (!userToRemove) {
      throw new Error('User not found');
    }

    // can not remove owner
    if (userToRemove.isOwner) {
      throw new Error('Can not remove owner');
    }

    // if the user involved in any channel then can not delete this user
    if ((await Channels.find({ userId: userToRemove._id }).count()) > 0) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    if (
      (await Channels.find({
        memberIds: { $in: [userToRemove._id] },
      }).count()) > 0
    ) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    return Users.removeUser(_id);
  },

  usersConfigEmailSignatures(
    _root,
    { signatures }: { signatures: IEmailSignature[] },
    { user }: { user: IUserDocument },
  ) {
    return Users.configEmailSignatures(user._id, signatures);
  },

  usersConfigGetNotificationByEmail(_root, { isAllowed }: { isAllowed: boolean }, { user }: { user: IUserDocument }) {
    return Users.configGetNotificationByEmail(user._id, isAllowed);
  },
};

requireLogin(userMutations, 'usersAdd');
requireLogin(userMutations, 'usersEdit');
requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');
requireLogin(userMutations, 'usersConfigGetNotificationByEmail');
requireLogin(userMutations, 'usersConfigEmailSignatures');
requireAdmin(userMutations, 'usersRemove');

export default userMutations;
