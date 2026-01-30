import { IContext } from '~/connectionResolvers';
import { IDonateDocument } from '~/modules/donate/@types/donate';
import { getLoyaltyOwner } from '~/utils/getOwner';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async owner(
    donate: IDonateDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType: donate.ownerType,
      ownerId: donate.ownerId,
    });
  },

  async campaign(
    donate: IDonateDocument,
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
        _id: donate.campaignId,
      },
    });
  },
};
