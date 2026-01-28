import { IContext } from '~/connectionResolvers';
import { ILotteryDocument } from '@/lottery/@types/lottery';
import { getLoyaltyOwner } from '~/utils/getOwner';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async owner(
    lottery: ILotteryDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType: lottery.ownerType,
      ownerId: lottery.ownerId,
    });
  },

  async campaign(
    lottery: ILotteryDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'campaign',
      action: 'findOne',
      input: {
        _id: lottery.campaignId,
      },
    });
  },
};
