import { Resolver } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { confirmVoucherSale } from '~/utils';

export const loyaltyMutations: Record<string, Resolver> = {
  async shareScore(
    _root: undefined,
    doc: {
      ownerType: string;
      ownerId: string;
      score: number;
      destinationOwnerId: string;
      destinationPhone: string;
      destinationEmail: string;
      destinationCode: string;
      campaignId?: string;
    },
    { models, subdomain, checkPermission, user }: IContext,
  ) {
    if (user) {
      await checkPermission('loyaltyShareScore');
    }
    const {
      ownerType,
      ownerId,
      score,
      destinationOwnerId,
      destinationPhone,
      destinationEmail,
      destinationCode,
      campaignId,
    } = doc;

    let destOwnerId = destinationOwnerId;

    if (ownerType === 'customer') {
      const customer = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: {
          _id: destinationOwnerId,
          customerPrimaryEmail: destinationEmail,
          customerPrimaryPhone: destinationPhone,
          customerCode: destinationCode,
        },
        defaultValue: {},
      });

      if (!customer) {
        throw new Error('Destination customer not found');
      }

      destOwnerId = customer._id;
    }

    const getUser = async (data) => {
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: data,
        defaultValue: {},
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
    }

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId,
      changeScore: -1 * score,
      description: 'share score',
      campaignId,
    });

    await models.ScoreLogs.changeScore({
      ownerType,
      ownerId: destOwnerId,
      changeScore: (score / 100) * (100 - fee),
      description: 'receipt score',
      campaignId,
    });

    return 'success';
  },

  async cpShareScore(
    _root: undefined,
    doc: {
      ownerType: string;
      ownerId: string;
      score: number;
      destinationOwnerId: string;
      destinationPhone: string;
      destinationEmail: string;
      destinationCode: string;
    },
    context: IContext,
    info: any
  ) {
    return loyaltyMutations.shareScore(_root, doc, context, info);
  },

  async confirmLoyalties(
    _root: undefined,
    param: {
      checkInfo: {
        [productId: string]: {
          voucherId: string;
          count: number;
        };
      };
    },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyConfirmVoucher');
    const { checkInfo } = param;

    return confirmVoucherSale(models, subdomain, checkInfo);
  },
};

loyaltyMutations.cpShareScore.wrapperConfig = {
  forClientPortal: true,
};
