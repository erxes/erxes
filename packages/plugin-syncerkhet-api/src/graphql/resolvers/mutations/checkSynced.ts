import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';
import { sendRPCMessage } from '../../../messageBrokerErkhet';
import { getPostData } from '../../../utils/ebarimtData';
import { getConfig } from '../../../utils/utils';

const checkSyncedMutations = {
  async toCheckSyncedDeals(
    _root,
    { dealIds }: { dealIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    const postData = {
      token: config.apiToken,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      orderIds: JSON.stringify(dealIds)
    };

    const response = await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
      action: 'check-order-synced',
      payload: JSON.stringify(postData),
      thirdService: true
    });

    const result = JSON.parse(response);

    return (Object.keys(result.data) || []).map(dealId => ({
      dealId,
      isSynced: result.data[dealId]
    }));
  },

  async toSyncDeals(
    _root,
    { dealIds }: { dealIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: []
    };

    const configs = await getConfig(subdomain, 'ebarimtConfig', {});
    const mainConfig = await getConfig(subdomain, 'ERKHET', {});

    const deals = await sendCardsMessage({
      subdomain,
      action: 'deals.find',
      data: { _id: { $in: dealIds } },
      isRPC: true
    });

    for (const deal of deals) {
      if (!Object.keys(configs).includes(deal.stageId)) {
        result.skipped.push(deal._id);
        continue;
      }

      const config = {
        ...configs[deal.stageId],
        ...mainConfig
      };
      const postData = await getPostData(subdomain, config, deal, false);

      const response = await sendRPCMessage(
        'rpc_queue:erxes-automation-erkhet',
        {
          action: 'get-response-send-order-info',
          isEbarimt: false,
          payload: JSON.stringify(postData),
          thirdService: true
        }
      );

      if (response.error) {
        result.error.push(deal._id);
        continue;
      }

      result.success.push(deal._id);
    }

    return result;
  }
};

// moduleCheckPermission(checkSyncedMutations, 'manageProducts');

export default checkSyncedMutations;
