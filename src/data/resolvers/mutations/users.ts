import { Channels, Users } from '../../../db/models';
import { IDetail, IEmailSignature, ILink, IUser, IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission, requireLogin } from '../../permissions';
import utils, { authCookieOptions, getEnv } from '../../utils';

interface IUsersEdit extends IUser {
  channelIds?: string[];
  groupIds?: string[];
  _id: string;
}

const userMutations = {
  /*
   * Login
   */
  async login(_root, args: { email: string; password: string }, { res }) {
    const response = await Users.login(args);

    const { token } = response;

    res.cookie('auth-token', token, authCookieOptions());

    return 'loggedIn';
  },

  async logout(_root, _args, { user, res }) {
    const response = await Users.logout(user);

    res.clearCookie('auth-token');

    return response;
  },

  /*
   * Send forgot password email
   */
  async forgotPassword(_root, { email }: { email: string }) {
    const token = await Users.forgotPassword(email);

    // send email ==============
    const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

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
   * Update user
   */
  async usersEdit(_root, args: IUsersEdit) {
    const { _id, username, email, channelIds = [], groupIds = [], details, links } = args;

    const updatedUser = await Users.updateUser(_id, {
      username,
      email,
      details,
      links,
      groupIds,
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
      throw new Error('Invalid password. Try again');
    }

    return Users.editProfile(user._id, { username, email, details, links });
  },

  /*
   * Set Active or inactive user
   */
  async usersSetActiveStatus(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    if (user._id === _id) {
      throw new Error('You can not delete yourself');
    }

    return Users.setUserActiveOrInactive(_id);
  },

  /*
   * Invites users to team members
   */
  async usersInvite(_root, { entries }: { entries: Array<{ email: string; groupId: string }> }) {
    for (const entry of entries) {
      await Users.checkDuplication({ email: entry.email });

      const token = await Users.createUserWithConfirmation(entry);

      const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });
      const confirmationUrl = `${MAIN_APP_DOMAIN}/confirmation?token=${token}`;

      utils.sendEmail({
        toEmails: [entry.email],
        title: 'Team member invitation',
        template: {
          name: 'userInvitation',
          data: {
            content: confirmationUrl,
            domain: MAIN_APP_DOMAIN,
          },
          isCustom: true,
        },
      });
    }
  },

  /*
   * User has seen onboard
   */
  async usersSeenOnBoard(_root, {}, { user }: { user: IUserDocument }) {
    return Users.updateOnBoardSeen({ _id: user._id });
  },

  async usersConfirmInvitation(
    _root,
    {
      token,
      password,
      passwordConfirmation,
      fullName,
      username,
    }: {
      token: string;
      password: string;
      passwordConfirmation: string;
      fullName?: string;
      username?: string;
    },
  ) {
    return Users.confirmInvitation({ token, password, passwordConfirmation, fullName, username });
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

requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');
requireLogin(userMutations, 'usersConfigGetNotificationByEmail');
requireLogin(userMutations, 'usersConfigEmailSignatures');

checkPermission(userMutations, 'usersEdit', 'usersEdit');
checkPermission(userMutations, 'usersInvite', 'usersInvite');
checkPermission(userMutations, 'usersSetActiveStatus', 'usersSetActiveStatus');

export default userMutations;
