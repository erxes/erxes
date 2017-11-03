import { Users, Channels } from '../../../db/models';
import utils from '../../../data/utils';

export default {
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
    const { COMPANY_EMAIL_FROM, MAIN_APP_DOMAIN } = process.env;

    const link = `${MAIN_APP_DOMAIN}/reset-password?token=${token}`;

    utils.sendEmail({
      toEmails: [email],
      fromEmail: COMPANY_EMAIL_FROM,
      title: 'Reset password',
      template: {
        name: 'base',
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
   * Create new user
   * @param {Object} args - User doc
   * @return {Promise} - Newly created user
   */
  async usersAdd(root, args, { user }) {
    const { username, password, passwordConfirmation, email, role, channelIds, details } = args;

    if (!user) throw new Error('Login required');

    if (password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    const createdUser = await Users.createUser({ username, password, email, role, details });

    // add new user to channels
    await Channels.updateUserChannels(channelIds, createdUser._id);

    // send email ================
    const { COMPANY_EMAIL_FROM } = process.env;

    utils.sendEmail({
      toEmails: [email],
      fromEmail: COMPANY_EMAIL_FROM,
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
  async usersEdit(root, args, { user }) {
    const {
      _id,
      username,
      password,
      passwordConfirmation,
      email,
      role,
      channelIds,
      details,
    } = args;

    if (!user) throw new Error('Login required');

    if (password && password !== passwordConfirmation) {
      throw new Error('Incorrect password confirmation');
    }

    // TODO check isOwner
    const updatedUser = await Users.updateUser(_id, { username, password, email, role, details });

    // add new user to channels
    await Channels.updateUserChannels(channelIds, _id);

    return updatedUser;
  },

  /*
   * Remove user
   * @param {String} _id - User _id
   * @return {Promise} - Remove user response
   */
  async usersRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    const userToRemove = await Users.findOne({ _id });

    // can not remove owner
    if (userToRemove.isOwner) {
      throw new Error('Can not remove owner');
    }

    return Users.removeUser(_id);
  },
};
