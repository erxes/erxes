import { Users, Channels } from '../../../db/models';
import utils from '../../../data/utils';
import { requireLogin, requireAdmin } from '../../permissions';

const userMutations = {
  /*
   * Login
   * @param {String} email - User email
   * @param {String} password - User password
   * @return tokens.token - Token to use authenticate against graphql endpoints
   * @return tokens.refreshToken - Token to use refresh expired token
   */
  login(root, args) {
    return Users.login(args);
  },

  /*
   * Send forgot password email
   * @param {String} email - Email to send link
   * @return {String} - Recover link
   */
  async forgotPassword(root, { email }) {
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
   * @param {String} token - Temporary token to find user
   * @param {String} newPassword - New password to set
   * @return {Promise} - Updated user object
   */
  resetPassword(root, args) {
    return Users.resetPassword(args);
  },

  /*
   * Change user password
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password to set
   * @return {Promise} - Updated user object
   */
  usersChangePassword(root, args, { user }) {
    return Users.changePassword({ _id: user._id, ...args });
  },

  /*
   * Create new user
   * @param {Object} args - User doc
   * @return {Promise} - Newly created user
   */
  async usersAdd(root, args) {
    const {
      username,
      password,
      passwordConfirmation,
      email,
      role,
      channelIds,
      details,
      links,
    } = args;

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

    // send email ================
    utils.sendEmail({
      toEmails: [email],
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
   * @param {Object} args - User doc
   * @return {Promise} - Updated user
   */
  async usersEdit(root, args) {
    const {
      _id,
      username,
      password,
      passwordConfirmation,
      email,
      role,
      channelIds,
      details,
      links,
    } = args;

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
   * @param {Object} args - User profile doc
   * @return {Promise} - Updated user
   */
  async usersEditProfile(root, { username, email, password, details, links }, { user }) {
    const userOnDb = await Users.findOne({ _id: user._id });
    const valid = await Users.comparePassword(password, userOnDb.password);

    if (!password || !valid) {
      // bad password
      throw new Error('Invalid password');
    }

    return Users.editProfile(user._id, { username, email, details, links });
  },

  /*
   * Remove user
   * @param {String} _id - User _id
   * @return {Promise} - Remove user response
   */
  async usersRemove(root, { _id }) {
    const userToRemove = await Users.findOne({ _id });

    // can not remove owner
    if (userToRemove.isOwner) {
      throw new Error('Can not remove owner');
    }

    // if the user involved in any channel then can not delete this user
    if ((await Channels.find({ userId: userToRemove._id }).count()) > 0) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    if ((await Channels.find({ memberIds: { $in: [userToRemove._id] } }).count()) > 0) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    return Users.removeUser(_id);
  },

  usersConfigEmailSignatures(root, { signatures }, { user }) {
    return Users.configEmailSignatures(user._id, signatures);
  },

  usersConfigGetNotificationByEmail(root, { isAllowed }, { user }) {
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
