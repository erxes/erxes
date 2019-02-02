import { Channels, Users } from '../../../db/models';
import { IDetail, IEmailSignature, ILink, IUser, IUserDocument } from '../../../db/models/definitions/users';
import { requireAdmin, requireLogin } from '../../permissions';
import utils from '../../utils';

interface IUsersEdit extends IUser {
  channelIds?: string[];
  _id: string;
}

const userMutations = {
  /*
   * Login
   */
  async login(_root, args: { email: string; password: string }, { res }) {
    const response = await Users.login(args);

    const { token } = response;

    const oneDay = 1 * 24 * 3600 * 1000; // 1 day

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      maxAge: oneDay,
      secure: false,
    };

    const { HTTPS } = process.env;

    if (HTTPS === 'true') {
      cookieOptions.secure = true;
    }

    res.cookie('auth-token', token, cookieOptions);

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
   * Update user
   */
  async usersEdit(_root, args: IUsersEdit) {
    const { _id, username, email, role, channelIds = [], details, links } = args;

    // TODO check isOwner
    const updatedUser = await Users.updateUser(_id, {
      username,
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
    if ((await Channels.find({ userId: userToRemove._id }).countDocuments()) > 0) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    if (
      (await Channels.find({
        memberIds: { $in: [userToRemove._id] },
      }).countDocuments()) > 0
    ) {
      throw new Error('You cannot delete this user. This user belongs other channel.');
    }

    return Users.removeUser(_id);
  },

  /*
   * Invites users to team members
   */
  async usersInvite(_root, { emails }: { emails: string[] }) {
    await Users.checkDuplication({ emails });

    for (const email of emails) {
      const token = await Users.createUserWithConfirmation({ email });

      const { MAIN_APP_DOMAIN } = process.env;
      const confirmationUrl = `${MAIN_APP_DOMAIN}/confirmation?token=${token}`;

      utils.sendEmail({
        toEmails: emails,
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
requireAdmin(userMutations, 'usersEdit');
requireAdmin(userMutations, 'usersRemove');
requireAdmin(userMutations, 'usersInvite');

export default userMutations;
