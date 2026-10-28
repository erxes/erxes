import {
  IDetail,
  IEmailSignature,
  ILink,
  IUser,
  Resolver,
} from 'erxes-api-shared/core-types';
import { clearGroupActionsCache } from 'erxes-api-shared/core-modules';
import {
  authCookieOptions,
  getEnv,
  getSaasOrganizationDetail,
  graphqlPubsub,
  withoutPermissionScope,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { assertCanManageSeat } from '@/organization/structure/access';
import { resolvePermissionScope } from '@/permissions/scope';
import { saveValidatedToken } from '~/modules/auth/utils';
import { sendInvitationEmail } from '../utils';
import { sendOnboardNotification } from '~/modules/notifications/utils';
import { ensurePermissionGroups } from '~/modules/permissions/utils';

export interface IUsersEdit extends IUser {
  channelIds?: string[];
  _id: string;
}

const publishUserStatusChanged = (
  subdomain: string,
  userId: string,
  updatedUser: IUser,
) => {
  const payload = { userStatusChanged: updatedUser };

  return Promise.all([
    graphqlPubsub.publish(`userStatusChanged:${subdomain}:${userId}`, payload),
    graphqlPubsub.publish(`userStatusChanged:${subdomain}`, payload),
  ]);
};

export const userMutations: Record<string, Resolver<any, any, IContext>> = {
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
    { models, subdomain }: IContext,
  ) {
    const userCount = await models.Users.countDocuments();

    if (userCount > 0) {
      throw new Error('Access denied');
    }

    await ensurePermissionGroups(models, subdomain);

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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersResetPassword');

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
  async usersEdit(
    _parent: undefined,
    args: IUsersEdit,
    { user, models, checkPermission }: IContext,
  ) {
    const { _id, ...doc } = args;

    if (user._id !== _id) {
      await checkPermission('teamMembersUpdate', _id);
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

    return models.Users.updateUser(_id, updatedDoc);
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
    }: {
      username: string;
      email: string;
      details: IDetail;
      links: ILink;
      employeeId: string;
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
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersRemove');

    if (user._id === _id) {
      throw new Error('You can not delete yourself');
    }

    const updatedUser = await models.Users.setUserActiveOrInactive(_id);

    await publishUserStatusChanged(subdomain, _id, updatedUser);

    return updatedUser;
  },

  async usersSetActiveStatusBatch(
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersRemove');

    for (const _id of _ids) {
      if (user._id === _id) {
        throw new Error('You can not delete yourself');
      }
    }

    for (const _id of _ids) {
      const targetUser = await models.Users.findOne({ _id });

      if (targetUser && targetUser.isActive !== false) {
        const updatedUser = await models.Users.setUserActiveOrInactive(_id);

        await publishUserStatusChanged(subdomain, _id, updatedUser);
      }
    }

    return true;
  },

  async usersInvite(
    _parent: undefined,
    {
      entries,
    }: {
      entries: Array<{
        email: string;
        password: string;
        entityId?: string;
        seatIds?: string[];
      }>;
    },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('teamMembersInvite');

    const invitesEverywhere =
      user.isOwner ||
      (
        await resolvePermissionScope(models, {
          userId: user._id,
          plugin: 'core',
          module: 'teamMembers',
          actions: ['teamMembersInvite'],
        })
      ).all;

    const placements = new Map<
      string,
      { entityId: string; seatIds: string[] }
    >();

    for (const entry of entries) {
      if (!entry.entityId) {
        if (!invitesEverywhere || entry.seatIds?.length) {
          throw new Error(`Choose a structure node for ${entry.email}`);
        }

        continue;
      }

      await checkPermission('structureEntitiesManage');

      const entity = await models.StructureEntities.getEntity(entry.entityId);
      const seatIds = [...new Set(entry.seatIds || [])];
      const seats = seatIds.length
        ? await models.StructureSeats.find({ _id: { $in: seatIds } })
        : [];

      if (
        seats.length !== seatIds.length ||
        seats.some((seat) => seat.entityId !== entity._id)
      ) {
        throw new Error('Seats must belong to the chosen node');
      }

      for (const seat of seats) {
        await assertCanManageSeat(models, user, seat);
      }

      placements.set(entry.email, { entityId: entity._id, seatIds });
    }

    for (const entry of entries) {
      await models.Users.checkDuplication({ email: entry.email });

      const token = await models.Users.invite({
        email: entry.email,
        password: entry.password,
      });
      const placement = placements.get(entry.email);

      if (placement) {
        const invited = await withoutPermissionScope(() =>
          models.Users.findOne(
            { email: entry.email.toLowerCase().trim() },
            { _id: 1 },
          ),
        );

        if (invited) {
          await models.StructureEntityMembers.addMember(
            { ...placement, userId: invited._id, isPrimary: true },
            user._id,
          );
          await clearGroupActionsCache({ userId: invited._id });
        }
      }

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
    return await models.Users.setChatStatus(_id, status);
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
