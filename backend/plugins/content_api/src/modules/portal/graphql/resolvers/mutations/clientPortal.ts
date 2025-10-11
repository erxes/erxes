import { IPortal } from '@/portal/@types/portal';
import { IContext } from '~/connectionResolvers';
import { createCard, participantEditRelation } from '@/portal/utils/cards';
import { checkPermission } from 'erxes-api-shared/core-modules';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalMutations = {
  async clientPortalConfigUpdate(
    _root,
    { config }: { config: IPortal },
    { models, user }: IContext,
  ) {
    try {
      const cpUser = await models.Users.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${config?.testUserEmail}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${config?.testUserPhone}$`, 'i') } },
        ],
        clientPortalId: config._id,
      });

      if (!cpUser) {
        if (
          config?.testUserEmail &&
          config?.testUserPhone &&
          config?.testUserPassword &&
          config._id
        ) {
          const args = {
            firstName: 'test clientportal user',
            email: config.testUserEmail,
            phone: config.testUserPhone,
            password: config.testUserPassword,
            clientPortalId: config._id,
            isPhoneVerified: true,
            isEmailVerified: true,
            notificationSettings: {
              receiveByEmail: false,
              receiveBySms: false,
              configs: [],
            },
          };

          await models.Users.createTestUser({
            ...args,
          });
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    const cp = await models.Portals.createOrUpdateConfig(config);

    if (cp) {
      // await sendCoreMessage({
      //   subdomain,
      //   action: 'registerOnboardHistory',
      //   data: {
      //     type: 'clientPortalSetup',
      //     user,
      //   },
      // });
    }

    if (
      config.template &&
      [
        'portfolio',
        'ecommerce',
        'hotel',
        'restaurant',
        'tour',
        'blog',
      ].includes(config.template)
    ) {
      // sendCommonMessage({
      //   subdomain,
      //   serviceName: 'cms',
      //   action: 'addPages',
      //   data: {
      //     clientPortalId: cp._id,
      //     kind: config.template,
      //     createdUserId: user._id,
      //   },
      // });
      // TODO: add pages
    }

    return cp;
  },

  async clientPortalRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.Pages.deleteMany({ clientPortalId: _id });

    await models.Portals.deleteOne({ _id });

    await models.Users.deleteMany({ clientPortalId: _id });

    await models.UserCards.deleteMany({ clientPortalId: _id });

    await models.Companies.deleteMany({ clientPortalId: _id });

    await models.Notifications.deleteMany({ clientPortalId: _id });

    await models.Comments.deleteMany({ clientPortalId: _id });

    await models.CustomPostTypes.deleteMany({ clientPortalId: _id });

    await models.Categories.deleteMany({ clientPortalId: _id });

    await models.Posts.deleteMany({ clientPortalId: _id });

    await models.Translations.deleteMany({ clientPortalId: _id });

    await models.Pages.deleteMany({ clientPortalId: _id });

    await models.PostTags.deleteMany({ clientPortalId: _id });

    await models.MenuItems.deleteMany({ clientPortalId: _id });

    await models.CustomFieldGroups.deleteMany({ clientPortalId: _id });

    return true;
  },

  async clientPortalCreateCard(_root, args, { portalUser, models }: IContext) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    return createCard(models, portalUser, args);
  },
  async clientPortalParticipantRelationEdit(
    _root,
    {
      type,
      cardId,
      cpUserIds,
      oldCpUserIds,
    }: {
      type: string;
      cardId: string;
      cpUserIds: [string];
      oldCpUserIds: [string];
    },
    { portalUser, models }: IContext,
  ) {
    return participantEditRelation(
      models,
      type,
      cardId,
      oldCpUserIds,
      cpUserIds,
    );
  },

  async clientPortalParticipantEdit(
    _root,
    args: {
      _id: string;
      contentType: string;
      contentTypeId: string;
      cpUserId: string;
      status: string;
      paymentStatus: string;
      paymentAmount: number;
      offeredAmount: number;
      hasVat: boolean;
    },
    { portalUser, models }: IContext,
  ) {
    const { _id, ...rest } = args;
    await models.UserCards.updateOne(
      { _id: args._id },
      {
        $set: {
          ...rest,
        },
      },
    );
    return models.UserCards.findOne({ _id: args._id });
  },
};

checkPermission(
  clientPortalMutations,
  'clientPortalConfigUpdate',
  'manageClientPortal',
);

checkPermission(
  clientPortalMutations,
  'clientPortalRemove',
  'removeClientPortal',
);

export default clientPortalMutations;
