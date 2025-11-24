import {
  IDetail,
  IEmailSignature,
  ILink,
  IUser,
  Resolver,
} from 'erxes-api-shared/core-types';
import {
  authCookieOptions,
  getEnv,
  getSaasOrganizationDetail,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { saveValidatedToken } from '~/modules/auth/utils';
import { sendInvitationEmail } from '../utils';
import { sendOnboardNotification } from '~/modules/notifications/utils';

export interface IUsersEdit extends IUser {
  channelIds?: string[];
  _id: string;
}

export const userMutations: Record<string, Resolver> = {
  async usersCreateOwner(
    _parent: undefined,
    {
      email,
      password,
      firstName,
      lastName,
      purpose,
      subscribeEmail,
    }: {
      email: string;
      password: string;
      firstName: string;
      purpose: string;
      lastName?: string;
      subscribeEmail?: boolean;
    },
    { models }: IContext,
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
        fullName: `${firstName} ${lastName || ''}`,
        firstName,
        lastName,
      },
    };

    await models.Users.createUser(doc);

    if (subscribeEmail && process.env.NODE_ENV === 'production') {
      await fetch('https://erxes.io/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          email,
          purpose,
          firstName,
          lastName,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return 'success';
  },

  /*
   * Reset member's password
   */
  async usersResetMemberPassword(
    _parent: undefined,
    args: { _id: string; newPassword: string },
    { models }: IContext,
  ) {
    return models.Users.resetMemberPassword(args);
  },

  /*
   * Change user password
   */
  async usersChangePassword(
    _parent: undefined,
    args: { currentPassword: string; newPassword: string },
    { user, models }: IContext,
  ) {
    return models.Users.changePassword({ _id: user._id, ...args });
  },

  /*
   * Update user
   */
  async usersEdit(_parent: undefined, args: IUsersEdit, { models }: IContext) {
    const { _id, ...doc } = args;

    // clean custom field values
    if (doc.customFieldsData) {
      doc.customFieldsData = doc.customFieldsData.map((cd) => ({
        ...cd,
        stringValue: cd.value ? cd.value.toString() : '',
      }));
    }

    let updatedDoc = doc;

    if (doc.details) {
      updatedDoc = {
        ...doc,
        details: {
          ...doc.details,
          fullName: `${doc.details.firstName || ''} ${
            doc.details.lastName || ''
          }`,
        },
      };
    }

    const updatedUser = await models.Users.updateUser(_id, updatedDoc);

    if (args.departmentIds || args.branchIds) {
      await models.UserMovements.manageUserMovement({
        user: updatedUser,
      });
    }

    return updatedUser;
  },

  /*
   * Edit user profile
   */
  async usersEditProfile(
    _parent: undefined,
    {
      username,
      email,
      details,
      links,
      employeeId,
      positionIds,
    }: {
      username: string;
      email: string;
      details: IDetail;
      links: ILink;
      employeeId: string;
      positionIds: string[];
    },
    { user, models }: IContext,
  ) {
    const doc = {
      username,
      email,
      details: {
        ...details,
        fullName: `${details.firstName || ''} ${details.lastName || ''}`,
      },
      links,
      employeeId,
      positionIds,
    };

    const updatedUser = await models.Users.editProfile(user._id, doc);

    return updatedUser;
  },

  /*
   * Set Active or inactive user
   */
  async usersSetActiveStatus(
    _parent: undefined,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    if (user._id === _id) {
      throw new Error('You can not delete yourself');
    }

    const updatedUser = await models.Users.setUserActiveOrInactive(_id);

    return updatedUser;
  },

  /*
   * Invites users to team members
   */
  async usersInvite(
    _parent: undefined,
    {
      entries,
    }: {
      entries: Array<{
        email: string;
        password: string;
      }>;
    },
    { models, subdomain, user }: IContext,
  ) {
    for (const entry of entries) {
      await models.Users.checkDuplication({ email: entry.email });

      const doc: any = entry;

      const docModified = doc;

      if (docModified?.scopeBrandIds?.length) {
        doc.brandIds = docModified.scopeBrandIds;
      }

      const token = await models.Users.invite(doc);

      sendInvitationEmail(models, subdomain, {
        email: entry.email,
        token,
        userId: user._id,
      });
    }
  },

  /*
   * Resend invitation
   */
  async usersResendInvitation(
    _parent: undefined,
    { email }: { email: string },
    { models }: IContext,
  ) {
    const token = await models.Users.resendInvitation({ email });

    return token;
  },

  async usersConfirmInvitation(
    _parent: undefined,
    {
      token: registrationToken,
    }: {
      token: string;
    },
    { res, models, requestInfo, subdomain }: IContext,
  ) {
    const user = await models.Users.findOne({
      registrationToken,
      registrationTokenExpires: {
        $gt: Date.now(),
      },
    });

    if (!user || !registrationToken) {
      throw new Error('Token is invalid or has expired');
    }

    const [token] = await models.Users.createTokens(
      user,
      models.Users.getSecret(),
    );

    await saveValidatedToken(token, user);

    await models.Users.updateOne(
      { _id: user._id },
      {
        $push: { validatedTokens: token },
        $set: { isActive: true },
        $unset: {
          registrationToken: '',
          registrationTokenExpires: '',
        },
      },
    );

    const sameSite = getEnv({ name: 'SAME_SITE' });
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const VERSION = getEnv({ name: 'VERSION' });

    if (VERSION === 'saas') {
      const organization = await getSaasOrganizationDetail({ subdomain });

      const cookieOptions: any = authCookieOptions();

      if (organization.domain && organization.dnsStatus === 'active') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'none';
      }

      res.cookie('auth-token', token, cookieOptions);
    } else {
      const cookieOptions: any = { secure: requestInfo.secure };

      if (
        sameSite &&
        sameSite === 'none' &&
        res.req.headers.origin !== DOMAIN
      ) {
        cookieOptions.sameSite = sameSite;
      }

      res.cookie('auth-token', token, authCookieOptions(cookieOptions));
    }

    await sendOnboardNotification(subdomain, models, user._id);

    return 'accepted';
  },
  async usersConfigEmailSignatures(
    _parent: undefined,
    { signatures }: { signatures: IEmailSignature[] },
    { user, models }: IContext,
  ) {
    return models.Users.configEmailSignatures(user._id, signatures);
  },

  async usersConfigGetNotificationByEmail(
    _parent: undefined,
    { isAllowed }: { isAllowed: boolean },
    { user, models }: IContext,
  ) {
    return models.Users.configGetNotificationByEmail(user._id, isAllowed);
  },

  async usersSetChatStatus(
    _parent: undefined,
    { _id, status }: { _id: string; status: string },
    { models }: IContext,
  ) {
    const getUser = await models.Users.getUser(_id);

    if (!getUser) {
      throw new Error('User not found');
    }

    return await models.Users.updateUser(_id, { chatStatus: status });
  },

  /*
   * Upgrade organization plan status
   */
  async editOrganizationInfo(
    _parent: undefined,
    {
      icon,
      link,
      name,
      iconColor,
      textColor,
      domain,
      favicon,
      description,
      backgroundColor,
      logo,
    }: {
      logo: string;
      icon: string;
      link: string;
      name: string;
      favicon: string;
      domain: string;
      iconColor: string;
      textColor: string;
      description: string;
      backgroundColor: string;
    },
    { subdomain, res, requestInfo }: IContext,
  ) {
    return;
  },

  async editOrganizationDomain(
    _parent: undefined,
    {
      domain,
      type,
    }: {
      domain: string;
      type: string;
    },
    { subdomain }: IContext,
  ) {
    return;
  },
};

userMutations.usersCreateOwner.wrapperConfig = {
  skipPermission: true,
};
userMutations.usersConfirmInvitation.wrapperConfig = {
  skipPermission: true,
};