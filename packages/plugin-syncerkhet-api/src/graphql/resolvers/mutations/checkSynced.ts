import { getConfig } from '../../../utils/utils';
import { getPostData as getPostDataOrders } from '../../../utils/orders';
import { getPostData } from '../../../utils/ebarimtData';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage, sendPosMessage } from '../../../messageBroker';
import { sendEbarimtMessage } from '../../../messageBroker';
import { sendRPCMessage } from '../../../messageBrokerErkhet';

const checkSyncedMutations = {
  async toCheckSynced(
    _root,
    { ids }: { ids: string[] },
    { subdomain }: IContext
  ) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found');
    }

    const postData = {
      token: config.apiToken,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      orderIds: JSON.stringify(ids)
    };

    const response = await sendRPCMessage('rpc_queue:erxes-automation-erkhet', {
      action: 'check-order-synced',
      payload: JSON.stringify(postData),
      thirdService: true
    });
    const result = JSON.parse(response);

    const data = result.data || {};

    return (Object.keys(data) || []).map(_id => {
      const res: any = data[_id] || {};
      return {
        _id,
        isSynced: res.isSynced,
        syncedDate: res.date,
        syncedBillNumber: res.bill_number
      };
    });
  },

  async toSyncDeals(
    _root,
    { dealIds }: { dealIds: string[] },
    { subdomain }: IContext
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
          thirdService: true,
          isJson: true
        }
      );

      if (response.message || response.error) {
        const txt = JSON.stringify({
          message: response.message,
          error: response.error
        });
        if (config.responseField) {
          await sendCardsMessage({
            subdomain,
            action: 'deals.updateOne',
            data: {
              selector: { _id: deal._id },
              modifier: {
                $push: {
                  customFieldsData: [
                    {
                      field: config.responseField.replace(
                        'customFieldsData.',
                        ''
                      ),
                      value: txt,
                      stringValue: txt
                    }
                  ]
                }
              }
            },
            isRPC: true
          });
        } else {
          console.log(txt);
        }
      }

      if (response.error) {
        result.error.push(deal._id);
        continue;
      }

      result.success.push(deal._id);
    }

    return result;
  },

  async toSyncOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain }: IContext
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: []
    };

    const orders = await sendPosMessage({
      subdomain,
      action: 'orders.find',
      data: { _id: { $in: orderIds } },
      isRPC: true,
      defaultValue: []
    });

    const posTokens = [...new Set((orders || []).map(o => o.posToken))];

    const poss = await sendPosMessage({
      subdomain,
      action: 'configs.find',
      data: { token: { $in: posTokens } },
      isRPC: true,
      defaultValue: []
    });

    const posByToken = {};
    for (const pos of poss) {
      posByToken[pos.token] = pos;
    }

    for (const order of orders) {
      const pos = posByToken[order.posToken];

      const postData = await getPostDataOrders(subdomain, pos, order);

      const response = await sendRPCMessage(
        'rpc_queue:erxes-automation-erkhet',
        {
          action: 'get-response-send-order-info',
          isEbarimt: false,
          payload: JSON.stringify(postData),
          thirdService: true,
          isJson: true
        }
      );

      if (response.message || response.error) {
        const txt = JSON.stringify({
          message: response.message,
          error: response.error
        });

        await sendPosMessage({
          subdomain,
          action: 'orders.updateOne',
          data: {
            selector: { _id: order._id },
            modifier: {
              $set: { syncErkhetInfo: txt }
            }
          },
          isRPC: true
        });
      }

      if (response.error) {
        result.error.push(order._id);
        continue;
      }

      result.success.push(order._id);
    }

    return result;
  }
};

export default checkSyncedMutations;
