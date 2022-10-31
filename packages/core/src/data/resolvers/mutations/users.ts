import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import * as telemetry from 'erxes-telemetry';
import { ILink } from '@erxes/api-utils/src/types';
import { authCookieOptions } from '@erxes/api-utils/src/core';

import {
  IDetail,
  IEmailSignature,
  IUser
} from '../../../db/models/definitions/users';
import {
  sendInboxMessage,
  sendIntegrationsMessage
} from '../../../messageBroker';
import { putCreateLog, putUpdateLog } from '../../logUtils';
import { resetPermissionsCache } from '../../permissions/utils';
import utils, { getEnv, sendRequest } from '../../utils';
import { IContext, IModels } from '../../../connectionResolver';

interface IUsersEdit extends IUser {
  channelIds?: string[];
  _id: string;
}

interface ILogin {
  email: string;
  password: string;
  deviceToken?: string;
}

const sendInvitationEmail = (
  models: IModels,
  subdomain: string,
  {
    email,
    token
  }: {
    email: string;
    token: string;
  }
) => {
  const DOMAIN = getEnv({ name: 'DOMAIN' });
  const confirmationUrl = `${DOMAIN}/confirmation?token=${token}`;

  utils.sendEmail(
    subdomain,
    {
      toEmails: [email],
      title: 'Team member invitation',
      template: {
        name: 'userInvitation',
        data: {
          content: confirmationUrl,
          domain: DOMAIN
        }
      }
    },
    models
  );
};

const userMutations = {
  async usersCreateOwner(
    _root,
    {
      email,
      password,
      firstName,
      lastName,
      purpose,
      subscribeEmail
    }: {
      email: string;
      password: string;
      firstName: string;
      purpose: string;
      lastName?: string;
      subscribeEmail?: boolean;
    },
    { models }: IContext
  ) {
    const userCount = await models.Users.countDocuments();

    if (userCount > 0) {
      throw new Error('Access denied');
    }

    const doc: IUser = {
      isOwner: true,
      email: (email || '').toLowerCase().trim(),
      password: (password || '').trim(),
      details: {
        fullName: `${firstName} ${lastName || ''}`
      }
    };

    await models.Users.createUser(doc);

    if (subscribeEmail && process.env.NODE_ENV === 'production') {
      await sendRequest({
        url: 'https://erxes.io/subscribe',
        method: 'POST',
        body: {
          email,
          purpose,
          firstName,
          lastName
        }
      });
    }

    await models.Configs.createOrUpdateConfig({
      code: 'UPLOAD_SERVICE_TYPE',
      value: 'local'
    });

    return 'success';
  },

  /*
   * Login
   */
  async login(_root, args: ILogin, { res, requestInfo, models }: IContext) {
    const response = await models.Users.login(args);

    const { token } = response;

    const cookieOptions: any = { secure: requestInfo.secure };

    res.cookie('auth-token', token, authCookieOptions(cookieOptions));

    telemetry.trackCli('logged_in');

    return 'loggedIn';
  },

  async logout(_root, _args, { res, user, requestInfo, models }: IContext) {
    const loggedout = await models.Users.logout(
      user,
      requestInfo.cookies['auth-token']
    );
    res.clearCookie('auth-token');
    return loggedout;
  },

  /*
   * Send forgot password email
   */
  async forgotPassword(
    _root,
    { email }: { email: string },
    { subdomain, models }: IContext
  ) {
    const token = await models.Users.forgotPassword(email);

    // send email ==============
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    const link = `${DOMAIN}/reset-password?token=${token}`;

    await utils.sendEmail(
      subdomain,
      {
        toEmails: [email],
        title: 'Reset password',
        template: {
          name: 'resetPassword',
          data: {
            content: link
          }
        }
      },
      models
    );

    return 'sent';
  },

  /*
   * Reset password
   */
  async resetPassword(
    _root,
    args: { token: string; newPassword: string },
    { models }: IContext
  ) {
    return models.Users.resetPassword(args);
  },

  /*
   * Reset member's password
   */
  usersResetMemberPassword(
    _root,
    args: { _id: string; newPassword: string },
    { models }: IContext
  ) {
    return models.Users.resetMemberPassword(args);
  },

  /*
   * Change user password
   */
  usersChangePassword(
    _root,
    args: { currentPassword: string; newPassword: string },
    { user, models }: IContext
  ) {
    return models.Users.changePassword({ _id: user._id, ...args });
  },

  /*
   * Update user
   */
  async usersEdit(
    _root,
    args: IUsersEdit,
    { user, models, subdomain }: IContext
  ) {
    const { _id, channelIds, ...doc } = args;
    const userOnDb = await models.Users.getUser(_id);

    const updatedUser = await models.Users.updateUser(_id, doc);

    if (channelIds) {
      await sendInboxMessage({
        subdomain,
        action: 'updateUserChannels',
        data: { channelIds, userId: _id }
      });
    }

    await resetPermissionsCache(models);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'user',
        description: 'edit profile',
        object: userOnDb,
        newData: doc,
        updatedDocument: updatedUser
      },
      user
    );

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
      links
    }: {
      username: string;
      email: string;
      password: string;
      details: IDetail;
      links: ILink;
    },
    { user, models, subdomain }: IContext
  ) {
    const userOnDb = await models.Users.getUser(user._id);

    const valid = await models.Users.comparePassword(
      password,
      userOnDb.password
    );

    if (!password || !valid) {
      // bad password
      throw new Error('Invalid password. Try again');
    }

    const doc = {
      username,
      email,
      details,
      links
    };
    const updatedUser = models.Users.editProfile(user._id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'user',
        description: 'edit profile',
        object: userOnDb,
        newData: doc,
        updatedDocument: updatedUser
      },
      user
    );

    return updatedUser;
  },

  /*
   * Set Active or inactive user
   */
  async usersSetActiveStatus(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    if (user._id === _id) {
      throw new Error('You can not delete yourself');
    }

    const updatedUser = await models.Users.setUserActiveOrInactive(_id);
    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'user',
        description: 'changed status',
        object: updatedUser,
        updatedDocument: updatedUser
      },
      user
    );

    return updatedUser;
  },

  /*
   * Invites users to team members
   */
  async usersInvite(
    _root,
    {
      entries
    }: {
      entries: Array<{
        email: string;
        password: string;
        groupId: string;
        channelIds?: string[];
        unitId?: string;
        branchId?: string;
        departmentId?: string;
      }>;
    },
    { user, subdomain, models }: IContext
  ) {
    for (const entry of entries) {
      await models.Users.checkDuplication({ email: entry.email });

      const token = await models.Users.invite(entry);
      const createdUser = await models.Users.findOne({ email: entry.email });

      if (entry.unitId) {
        await models.Units.updateOne(
          { _id: entry.unitId },
          { $push: { userIds: createdUser?._id } }
        );
      }

      if (entry.branchId) {
        await models.Branches.updateOne(
          { _id: entry.branchId },
          { $push: { userIds: createdUser?._id } }
        );
      }

      if (entry.departmentId) {
        await models.Departments.updateOne(
          { _id: entry.departmentId },
          { $push: { userIds: createdUser?._id } }
        );
      }

      sendInvitationEmail(models, subdomain, { email: entry.email, token });

      await putCreateLog(
        models,
        subdomain,
        {
          type: 'user',
          description: 'invited user',
          object: createdUser,
          newData: createdUser || {}
        },
        user
      );
    }

    await resetPermissionsCache(models);
  },

  /*
   * Resend invitation
   */
  async usersResendInvitation(
    _root,
    { email }: { email: string },
    { subdomain, models }: IContext
  ) {
    const token = await models.Users.resendInvitation({ email });

    sendInvitationEmail(models, subdomain, { email, token });

    return token;
  },

  async usersConfirmInvitation(
    _root,
    {
      token,
      password,
      passwordConfirmation,
      fullName,
      username
    }: {
      token: string;
      password: string;
      passwordConfirmation: string;
      fullName?: string;
      username?: string;
    },
    { subdomain, models }: IContext
  ) {
    const user = await models.Users.confirmInvitation({
      token,
      password,
      passwordConfirmation,
      fullName,
      username
    });

    await sendIntegrationsMessage({
      subdomain,
      action: 'notification',
      data: {
        type: 'addUserId',
        payload: {
          _id: user._id
        }
      }
    });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: 'user',
        description: 'confirm invitation',
        object: user,
        updatedDocument: user
      },
      user
    );
    return user;
  },

  usersConfigEmailSignatures(
    _root,
    { signatures }: { signatures: IEmailSignature[] },
    { user, models }: IContext
  ) {
    return models.Users.configEmailSignatures(user._id, signatures);
  },

  usersConfigGetNotificationByEmail(
    _root,
    { isAllowed }: { isAllowed: boolean },
    { user, models }: IContext
  ) {
    return models.Users.configGetNotificationByEmail(user._id, isAllowed);
  }
};

requireLogin(userMutations, 'usersChangePassword');
requireLogin(userMutations, 'usersEditProfile');
requireLogin(userMutations, 'usersConfigGetNotificationByEmail');
requireLogin(userMutations, 'usersConfigEmailSignatures');

checkPermission(userMutations, 'usersEdit', 'usersEdit');
checkPermission(userMutations, 'usersInvite', 'usersInvite');
checkPermission(userMutations, 'usersResendInvitation', 'usersInvite');
checkPermission(userMutations, 'usersSetActiveStatus', 'usersSetActiveStatus');
checkPermission(userMutations, 'usersResetMemberPassword', 'usersEdit');

export default userMutations;
