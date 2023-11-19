import { getConfig, sendCardInfo } from '../../../utils/utils';
import { getPostData as getPostDataOrders } from '../../../utils/orders';
import { getMoveData, getPostData } from '../../../utils/ebarimtData';
import { generateModels, IContext } from '../../../connectionResolver';
import { sendCardsMessage, sendPosMessage } from '../../../messageBroker';
import { sendRPCMessage, sendTRPCMessage } from '../../../messageBrokerErkhet';

const checkSyncedMutations = {
  async toCheckSynced(_root, { ids }: { ids: string[] }, { models }: IContext) {
    const config = await models.Configs.getConfig('ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found');
    }

    const postData = {
      token: config.apiToken,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      orderIds: JSON.stringify(ids)
    };

    const response = await sendTRPCMessage(
      'rpc_queue:erxes-automation-erkhet',
      {
        action: 'check-order-synced',
        payload: JSON.stringify(postData),
        thirdService: true
      }
    );
    const result = JSON.parse(response);

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    const data = result.data || {};

    return (Object.keys(data) || []).map(_id => {
      const res: any = data[_id] || {};
      return {
        _id,
        isSynced: res.isSynced,
        syncedDate: res.date,
        syncedBillNumber: res.bill_number,
        syncedCustomer: res.customer
      };
    });
  },

  async toSyncDeals(
    _root,
    {
      dealIds,
      configStageId,
      dateType
    }: { dealIds: string[]; configStageId: string; dateType: string },
    { subdomain, user, models }: IContext
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: []
    };

    const configs = await models.Configs.getConfig('ebarimtConfig', {});
    const moveConfigs = await models.Configs.getConfig('stageInMoveConfig', {});
    const mainConfig = await models.Configs.getConfig('ERKHET', {});

    const deals = await sendCardsMessage({
      subdomain,
      action: 'deals.find',
      data: { _id: { $in: dealIds } },
      isRPC: true
    });

    const syncLogDoc = {
      contentType: 'cards:deal',
      createdAt: new Date(),
      createdBy: user._id
    };

    for (const deal of deals) {
      const syncedStageId = configStageId || deal.stageId;
      if (Object.keys(configs).includes(syncedStageId)) {
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: deal._id,
          consumeData: deal,
          consumeStr: JSON.stringify(deal)
        });
        try {
          const config = {
            ...configs[syncedStageId],
            ...mainConfig
          };
          const postData = await getPostData(
            subdomain,
            models,
            user,
            config,
            deal,
            dateType
          );

          const response = await sendRPCMessage(
            models,
            syncLog,
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
              await sendCardInfo(subdomain, deal, config, txt);
            } else {
              console.log(txt);
            }
          }

          if (response.error) {
            result.error.push(deal._id);
            continue;
          }

          result.success.push(deal._id);
          continue;
        } catch (e) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error: e.message } }
          );
        }
      }

      if (Object.keys(moveConfigs).includes(syncedStageId)) {
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: deal._id,
          consumeData: deal,
          consumeStr: JSON.stringify(deal)
        });
        try {
          const config = {
            ...moveConfigs[syncedStageId],
            ...mainConfig
          };

          const postData = await getMoveData(subdomain, config, deal, dateType);

          const response = await sendRPCMessage(
            models,
            syncLog,
            'rpc_queue:erxes-automation-erkhet',
            {
              action: 'get-response-inv-movement-info',
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
              await sendCardInfo(subdomain, deal, config, txt);
            } else {
              console.log(txt);
            }
          }

          if (response.error) {
            result.error.push(deal._id);
            continue;
          }

          result.success.push(deal._id);
          continue;
        } catch (e) {
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error: e.message } }
          );
        }
      }
      result.skipped.push(deal._id);
    }

    return result;
  },

  async toSyncOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext
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
    const models = await generateModels(subdomain);
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

    const syncLogDoc = {
      contentType: 'pos:order',
      createdAt: new Date(),
      createdBy: user._id
    };

    for (const order of orders) {
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: order._id,
        consumeData: order,
        consumeStr: JSON.stringify(order)
      });
      try {
        const pos = posByToken[order.posToken];

        const postData = await getPostDataOrders(subdomain, pos, order);

        const response = await sendRPCMessage(
          models,
          syncLog,
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
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } }
        );
      }
    }

    return result;
  }
};

export default checkSyncedMutations;
