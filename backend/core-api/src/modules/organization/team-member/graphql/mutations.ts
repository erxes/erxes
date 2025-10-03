import { IContext } from '~/connectionResolvers';
import {
  IUser,
  IDetail,
  ILink,
  IEmailSignature,
} from 'erxes-api-shared/core-types';

export interface IUsersEdit extends IUser {
  channelIds?: string[];
  _id: string;
}

export const userMutations = {
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
    { models, __ }: IContext,
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
      positionIds
    }: {
      username: string;
      email: string;
      details: IDetail;
      links: ILink;
      employeeId: string;
      positionIds: string[]
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
      positionIds
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
        groupId: string;
        channelIds?: string[];
        unitId?: string;
        branchId?: string;
        departmentId?: string;
      }>;
    },
    { models }: IContext,
  ) {
    for (const entry of entries) {
      await models.Users.checkDuplication({ email: entry.email });

      const doc: any = entry;

      const docModified = doc;

      if (docModified?.scopeBrandIds?.length) {
        doc.brandIds = docModified.scopeBrandIds;
      }
      const createdUser = await models.Users.findOne({ email: entry.email });

      if (entry.branchId) {
        await models.Users.updateOne(
          { _id: createdUser?._id },
          {
            $addToSet: { branchIds: entry.branchId },
          },
        );
      }

      if (entry.departmentId) {
        await models.Users.updateOne(
          { _id: createdUser?._id },
          {
            $addToSet: { departmentIds: entry.departmentId },
          },
        );
      }
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
    { models }: IContext,
  ) {
    const user = await models.Users.confirmInvitation({
      token,
      password,
      passwordConfirmation,
      fullName,
      username,
    });

    return user;
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
