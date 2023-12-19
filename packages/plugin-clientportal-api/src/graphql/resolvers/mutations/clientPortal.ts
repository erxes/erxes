import { sendCardsMessage, sendContactsMessage } from '../../../messageBroker';

import { IClientPortal } from '../../../models/definitions/clientPortal';
import { IContext } from '../../../connectionResolver';
import { checkPermission } from '@erxes/api-utils/src';
import { putActivityLog } from '../../../logUtils';
import { getUserName } from '../../../utils';
import { createCard } from '../../../models/utils';

export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalMutations = {
  async clientPortalConfigUpdate(
    _root,
    { config }: { config: IClientPortal },
    { models, subdomain }: IContext
  ) {
    try {
      const cpUser = await models.ClientPortalUsers.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${config?.testUserEmail}$`, 'i') } },
          { phone: { $regex: new RegExp(`^${config?.testUserPhone}$`, 'i') } }
        ],
        clientPortalId: config._id
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
              configs: []
            }
          };

          await models.ClientPortalUsers.createTestUser(subdomain, {
            ...args
          });
        }
      }
    } catch (e) {
      console.log(e.message);
    }

    return models.ClientPortals.createOrUpdateConfig(config);
  },

  clientPortalRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCard(
    _root,
    args,
    { subdomain, cpUser, models }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    return createCard(subdomain, models, cpUser, args);
  }
};

checkPermission(
  clientPortalMutations,
  'clientPortalConfigUpdate',
  'manageClientPortal'
);

checkPermission(
  clientPortalMutations,
  'clientPortalRemove',
  'removeClientPortal'
);

export default clientPortalMutations;
