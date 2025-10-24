import {
  sendNotification,
  checkPermission,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { confirmVoucherSale } from '~/modules/loyalty/trpc/utils';

export interface IParam {
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
      destinationCode,
    } = doc;

    let destOwnerId = destinationOwnerId;

    if (ownerType === 'customer') {
      // const customer = await sendCoreMessage({
      //   subdomain,
      //   action: 'customers.findOne',
      //   data: {
      //     _id: destinationOwnerId,
      //     customerPrimaryEmail: destinationEmail,
      //     customerPrimaryPhone: destinationPhone,
      //     customerCode: destinationCode,
      //   },
      //   isRPC: true,
      // });
      const customer = await sendTRPCMessage({
        subdomain: subdomain,
        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: {
          _id: destinationOwnerId,
          customerPrimaryEmail: destinationEmail,
          customerPrimaryPhone: destinationPhone,
          customerCode: destinationCode,
        },
      });

      if (!customer) {
        throw new Error('Destination customer not found');
      }

      destOwnerId = customer._id;
    }

    const getUser = async (data) => {
      // return await sendCoreMessage({
      //   subdomain,
      //   action: 'users.findOne',
      //   data,
      //   isRPC: true,
      // });
      return await sendTRPCMessage({
        subdomain: subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: data,
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

      const owner = await sendTRPCMessage({
        subdomain: subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: ownerId },
        defaultValue: {},
      });
      // await sendCoreMessage({
      //   subdomain,
      //   action: 'users.findOne',
      //   data: { _id: ownerId },
      //   isRPC: true,
      //   defaultValue: {},
      // });

      // sendNotification(subdomain, {
      //   createdUser: owner,
      //   title: 'Loyalty',
      //   notifType: 'plugin',
      //   action: `send score to you`,
      //   content: 'Loyalty',
      //   link: `/erxes-plugin-loyalty`,
      //   receivers: [destOwnerId],
      // });
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'notification',
        action: 'send',
        input: {
          createdUser: owner,
          title: 'Loyalty',
          notifType: 'plugin',
          action: `send score to you`,
          content: 'Loyalty',
          link: `/erxes-plugin-loyalty`,
          receivers: [destOwnerId],
        },
      });

      // sendCoreMessage({
      //   subdomain,
      //   action: 'sendMobileNotification',
      //   data: {
      //     title: `${owner.details.fullName} sent score to you`,
      //     body: `${owner.details.fullName} sent ${
      //       (score / 100) * (100 - fee)
      //     } score to you`,
      //     receivers: [destOwnerId],
      //   },
      // });
      await sendTRPCMessage({
        subdomain: subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'sendMobileNotification',
        input: {
          title: `${owner.details.fullName} sent score to you`,
          body: `${owner.details.fullName} sent ${
            (score / 100) * (100 - fee)
          } score to you`,
          receivers: [destOwnerId],
        },
        defaultValue: {},
      });
    }

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId,
      changeScore: -1 * score,
      description: 'share score',
    });

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId: destOwnerId,
      changeScore: (score / 100) * (100 - fee),
      description: 'receipt score',
    });

    return 'success';
  },

  async confirmLoyalties(_root, param, { models, subdomain }: IContext) {
    const { checkInfo } = param;
    return confirmVoucherSale(models, subdomain, checkInfo);
  },
};

checkPermission(loyaltiesMutations, 'shareScore', 'manageLoyalties');
checkPermission(loyaltiesMutations, 'confirmLoyalties', 'manageLoyalties');

export default loyaltiesMutations;
