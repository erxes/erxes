import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { confirmVoucherSale } from '../../../utils';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendNotification
} from '../../../messageBroker';

interface IParam {
  ownerType: string;
  ownerId: string;
  score: number;
  destinationOwnerId: string;
  destinationPhone: string;
  destinationEmail: string;
  destinationCode: string;
}

const loyaltiesMutations = {
  async shareScore(_root, doc: IParam, { models, subdomain }: IContext) {
    const {
      ownerType,
      ownerId,
      score,
      destinationOwnerId,
      destinationPhone,
      destinationEmail,
      destinationCode
    } = doc;

    let destOwnerId = destinationOwnerId;

    if (ownerType === 'customer') {
      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          _id: destinationOwnerId,
          customerPrimaryEmail: destinationEmail,
          customerPrimaryPhone: destinationPhone,
          customerCode: destinationCode
        },
        isRPC: true
      });

      if (!customer) {
        throw new Error('Destination customer not found');
      }

      destOwnerId = customer._id;
    }

    const getUser = async data => {
      return await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data,
        isRPC: true
      });
    };

    const fee = (
      (await models.LoyaltyConfigs.getConfig('ShareScoreFee')) || { value: 0 }
    ).value;

    if (ownerType === 'user') {
      let user;
      if (destinationOwnerId) {
        user = await getUser({ _id: destinationOwnerId });
      }

      if (!user && destinationEmail) {
        user = await getUser({ email: destinationEmail });
      }

      if (!user && destinationCode) {
        user = await getUser({ code: destinationCode });
      }

      if (!user && destinationPhone) {
        user = await getUser({ 'details.operatorPhone': destinationPhone });
      }

      if (!user) {
        throw new Error('Destination team member not found');
      }

      destOwnerId = user._id;

      const owner = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: ownerId },
        isRPC: true,
        defaultValue: {}
      });

      sendNotification(subdomain, {
        createdUser: owner,
        title: 'Loyalty',
        notifType: 'plugin',
        action: `send score to you`,
        content: 'Loyalty',
        link: `/erxes-plugin-loyalty`,
        receivers: [destOwnerId]
      });

      sendCoreMessage({
        subdomain,
        action: 'sendMobileNotification',
        data: {
          title: `${owner.details.fullName} sent score to you`,
          body: `${owner.details.fullName} sent ${(score / 100) *
            (100 - fee)} score to you`,
          receivers: [destOwnerId]
        }
      });
    }

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId,
      changeScore: -1 * score,
      description: 'share score'
    });

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId: destOwnerId,
      changeScore: (score / 100) * (100 - fee),
      description: 'receipt score'
    });

    return 'success';
  },

  async confirmLoyalties(_root, param, { models }: IContext) {
    const { checkInfo } = param;
    return confirmVoucherSale(models, checkInfo);
  }
};

checkPermission(loyaltiesMutations, 'lotteriesAdd', 'manageLoyalties');
checkPermission(loyaltiesMutations, 'lotteriesEdit', 'manageLoyalties');
checkPermission(loyaltiesMutations, 'lotteriesRemove', 'manageLoyalties');

export default loyaltiesMutations;
