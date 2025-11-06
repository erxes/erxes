import {
  getConfig,
  getConfigPostData,
  getMoveData,
  getPosPostData,
  sendCardInfo,
} from '@/erkhet/utils';
import { sendTRPCMessage } from 'erxes-api-shared/src/utils';
import { generateModels, IContext } from '~/connectionResolvers';

const checkSyncedMutations = {
  async toCheckSynced(
    _root: undefined,
    { ids }: { ids: string[] },
    { subdomain }: IContext,
  ) {
    const config = await getConfig(subdomain, 'ERKHET', {});

    if (!config.apiToken || !config.apiKey || !config.apiSecret) {
      throw new Error('Erkhet config not found');
    }

    const postData = {
      token: config.apiToken,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      orderIds: JSON.stringify(ids),
    };

    // const response = await sendTRPCMessage(
    //   "rpc_queue:erxes-automation-erkhet",
    //   {
    //     action: "check-order-synced",
    //     payload: JSON.stringify(postData),
    //     thirdService: true
    //   }
    // );
    const result = JSON.parse('{}');

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    const data = result.data || {};

    return (Object.keys(data) || []).map((_id) => {
      const res: any = data[_id] || {};
      return {
        _id,
        isSynced: res.isSynced,
        syncedDate: res.date,
        syncedBillNumber: res.bill_number,
        syncedCustomer: res.customer,
      };
    });
  },

  async toSyncDeals(
    _root: undefined,
    {
      dealIds,
      configStageId,
      dateType,
    }: { dealIds: string[]; configStageId: string; dateType: string },
    { subdomain, user }: IContext,
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: [],
    };

    const configs = await getConfig(subdomain, 'ebarimtConfig', {});
    const moveConfigs = await getConfig(subdomain, 'stageInMoveConfig', {});
    const mainConfig = await getConfig(subdomain, 'ERKHET', {});

    const models = await generateModels(subdomain);

    const deals = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'deals',
      action: 'find',
      input: { _id: { $in: dealIds } },
      method: 'query',
      defaultValue: [],
    });

    const syncLogDoc = {
      contentType: 'sales:deal',
      createdAt: new Date(),
      createdBy: user._id,
    };

    for (const deal of deals) {
      const syncedStageId = configStageId || deal.stageId;
      if (Object.keys(configs).includes(syncedStageId)) {
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: deal._id,
          consumeData: deal,
          consumeStr: JSON.stringify(deal),
        });
        try {
          const config = {
            ...configs[syncedStageId],
            ...mainConfig,
          };

          const pipeline = await sendTRPCMessage({
            subdomain,
            pluginName: 'sales',
            module: 'pipelines',
            action: 'findOne',
            input: { stageId: configStageId || deal.stageId },
            method: 'query',
            defaultValue: {},
          });

          const postData = await getConfigPostData(
            subdomain,
            config,
            deal,
            pipeline.paymentTypes,
            dateType,
          );

          //   const response = await sendRPCMessage(
          //     models,
          //     syncLog,
          //     "rpc_queue:erxes-automation-erkhet",
          //     {
          //       action: "get-response-send-order-info",
          //       isEbarimt: false,
          //       payload: JSON.stringify(postData),
          //       thirdService: true,
          //       isJson: true
          //     }
          //   );

          const response: any = {};

          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error,
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
            { $set: { error: e.message } },
          );
        }
      }

      if (Object.keys(moveConfigs).includes(syncedStageId)) {
        const syncLog = await models.SyncLogs.syncLogsAdd({
          ...syncLogDoc,
          contentId: deal._id,
          consumeData: deal,
          consumeStr: JSON.stringify(deal),
        });
        try {
          const config = {
            ...moveConfigs[syncedStageId],
            ...mainConfig,
          };

          const postData = await getMoveData(subdomain, config, deal, dateType);

          //   const response = await sendRPCMessage(
          //     models,
          //     syncLog,
          //     "rpc_queue:erxes-automation-erkhet",
          //     {
          //       action: "get-response-inv-movement-info",
          //       isEbarimt: false,
          //       payload: JSON.stringify(postData),
          //       thirdService: true,
          //       isJson: true
          //     }
          //   );
          const response: any = {};

          if (response.message || response.error) {
            const txt = JSON.stringify({
              message: response.message,
              error: response.error,
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
            { $set: { error: e.message } },
          );
        }
      }
      result.skipped.push(deal._id);
    }

    return result;
  },

  async toSyncOrders(
    _root: undefined,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext,
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: [],
    };

    const orders = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'pos',
      action: 'orders.find',
      input: { _id: { $in: orderIds } },
      defaultValue: [],
    });

    const posTokens = [...new Set((orders || []).map((o) => o.posToken))];
    const models = await generateModels(subdomain);
    const poss = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'pos',
      action: 'configs.find',
      input: { token: { $in: posTokens } },
      defaultValue: [],
    });

    const posByToken = {};
    for (const pos of poss) {
      posByToken[pos.token] = pos;
    }

    const syncLogDoc = {
      contentType: 'sales:pos:order',
      createdAt: new Date(),
      createdBy: user._id,
    };

    for (const order of orders) {
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: order._id,
        consumeData: order,
        consumeStr: JSON.stringify(order),
      });
      try {
        const pos = posByToken[order.posToken];

        const postData = await getPosPostData(
          subdomain,
          pos,
          order,
          pos.paymentTypes,
        );

        if (!postData) {
          result.skipped.push(order._id);
          throw new Error('maybe, has not config');
        }

        // const response = await sendRPCMessage(
        //   models,
        //   syncLog,
        //   "rpc_queue:erxes-automation-erkhet",
        //   {
        //     action: "get-response-send-order-info",
        //     isEbarimt: false,
        //     payload: JSON.stringify(postData),
        //     thirdService: true,
        //     isJson: true
        //   }
        // );

        const response: any = {};

        if (response.message || response.error) {
          const txt = JSON.stringify({
            message: response.message,
            error: response.error,
          });

          await sendTRPCMessage({
            subdomain,
            pluginName: 'sales',
            module: 'pos',
            action: 'orders.updateOne',
            input: {
              selector: { _id: order._id },
              modifier: {
                $set: { syncErkhetInfo: txt },
              },
            },
            method: 'mutation',
            defaultValue: {},
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
          { $set: { error: e.message } },
        );
      }
    }

    return result;
  },
};

export default checkSyncedMutations;
