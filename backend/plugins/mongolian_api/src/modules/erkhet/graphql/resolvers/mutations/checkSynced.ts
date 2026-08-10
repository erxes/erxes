import {
  getConfig,
  getConfigPostData,
  getMoveData,
  getPosPostData,
  sendCardInfo,
  sendErkhetPost,
} from '@/erkhet/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, IContext } from '~/connectionResolvers';

const parseCheckSyncedData = (data: any) => {
  if (typeof data !== 'string') {
    return data?.data || data || {};
  }

  try {
    const parsed = JSON.parse(data);
    return parsed?.data || parsed || {};
  } catch (_e) {
    // text is not valid JSON, so return it as-is
    return {};
  }
};

const getSyncErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error) || String(error);
  } catch (_e) {
    return String(error);
  }
};

const checkSyncedMutations = {
  async toCheckSynced(
    _root: undefined,
    { ids }: { ids: string[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

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

    const models = await generateModels(subdomain);

    const result = await sendErkhetPost(models, 'check-order-synced', postData);

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    const resultData = parseCheckSyncedData(result.data);

    return ids.map((_id) => {
      const res: any = resultData[_id] || {};
      return {
        _id,
        isSynced: res.isSynced || false,
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
    { subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

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
      module: 'deal',
      action: 'find',
      input: { _id: { $in: dealIds } },
      defaultValue: [],
    });

    const syncLogDoc = {
      contentType: 'sales:deal',
      createdAt: new Date(),
      createdBy: user._id,
    };

    for (const deal of deals || []) {
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
            ...mainConfig,
            ...configs[syncedStageId],
          };

          const pipeline = await sendTRPCMessage({
            subdomain,
            pluginName: 'sales',
            module: 'pipeline',
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

          const response = await sendErkhetPost(
            models,
            'get-response-send-order-info',
            postData,
            syncLog,
          );

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
        } catch (e: unknown) {
          const error = getSyncErrorMessage(e);

          result.error.push(deal._id);
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error } },
          );
          continue;
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
            ...mainConfig,
            ...moveConfigs[syncedStageId],
          };

          const postData = await getMoveData(subdomain, config, deal, dateType);

          const response = await sendErkhetPost(
            models,
            'get-response-inv-movement-info',
            postData,
            syncLog,
          );

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
        } catch (e: unknown) {
          const error = getSyncErrorMessage(e);

          result.error.push(deal._id);
          await models.SyncLogs.updateOne(
            { _id: syncLog._id },
            { $set: { error } },
          );
          continue;
        }
      }
      result.skipped.push(deal._id);
    }

    return result;
  },

  async toSyncOrders(
    _root: undefined,
    { orderIds }: { orderIds: string[] },
    { subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: [],
    };

    const orders = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      method: 'query',
      module: 'orders',
      action: 'find',
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
      action: 'find',
      input: { token: { $in: posTokens } },
      defaultValue: [],
    });

    const posByToken = {};
    for (const pos of poss) {
      posByToken[pos.token] = pos;
    }

    const posIds = (poss || []).map((pos) => pos._id).filter(Boolean);
    const posOrderConfigs = posIds.length
      ? await models.Configs.find({
          code: 'posOrderErkhetConfig',
          subId: { $in: posIds },
        }).lean()
      : [];
    const posOrderConfigByPosId = {};

    for (const config of posOrderConfigs) {
      if (config.subId) {
        posOrderConfigByPosId[config.subId] = config.value || {};
      }
    }

    const syncLogDoc = {
      contentType: 'pos:order',
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

        if (!pos) {
          result.skipped.push(order._id);
          throw new Error('POS config not found');
        }

        const posOrderConfig = posOrderConfigByPosId[pos._id];

        if (!posOrderConfig?.isSyncErkhet) {
          result.skipped.push(order._id);
          throw new Error('Erkhet POS order config not found');
        }

        const postData = await getPosPostData(
          subdomain,
          pos,
          order,
          pos.paymentTypes,
          posOrderConfig,
        );

        if (!postData) {
          result.skipped.push(order._id);
          throw new Error('maybe, has not config');
        }

        const response = await sendErkhetPost(
          models,
          'get-response-send-order-info',
          postData,
          syncLog,
        );

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
                syncErkhetInfo: txt,
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
        result.error.push(order._id);
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
