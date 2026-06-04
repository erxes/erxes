import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { dealToReturnTrs } from '~/meta/afterProcessHandlers/dealToReturnTrs';
import { dealToTrs } from '~/meta/afterProcessHandlers/dealToTrs';
import { orderToReturnTrs } from '~/meta/afterProcessHandlers/orderToReturnTrs';
import { orderToTrs } from '~/meta/afterProcessHandlers/orderToTrs';
import {
  checkSynced,
  createResult,
  getAccountingContentType,
  getErrorMessage,
  setDealAccountingResponse,
  setOrderAccountingResponse
} from '~/modules/accounting/utils/checkSynced';


type SalesDeal = {
  _id: string;
  stageId?: string;
};

type PosOrder = {
  _id: string;
  posId?: string;
  status?: string;
};

type DealSyncConfig = Parameters<typeof dealToTrs>[0]['config'] & {
  stageId?: string;
  responseFieldId?: string;
};

type DealReturnSyncConfig = Parameters<typeof dealToReturnTrs>[0]['config'] & {
  stageId?: string;
  responseFieldId?: string;
};

type OrderSyncConfig = Parameters<typeof orderToTrs>[0]['config'] & {
  posId?: string;
};

type OrderReturnSyncConfig = Parameters<
  typeof orderToReturnTrs
>[0]['config'] & {
  posId?: string;
};

// #region Mutations
const checkSyncedMutations = {
  async accountingCheckSynced(
    _root: undefined,
    { ids, contentType }: { ids?: string[]; contentType?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAccountingConfigs');

    const checkedIds = ids || [];

    if (!checkedIds.length) {
      return [];
    }

    return checkSynced({
      models,
      ids: checkedIds,
      contentType: getAccountingContentType(contentType),
    });
  },

  async accountingSyncDeals(
    _root: undefined,
    { dealIds, configStageId }: { dealIds?: string[]; configStageId?: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');

    const result = createResult();
    const ids = dealIds || [];

    if (!ids.length) {
      return result;
    }

    const deals = (await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'deal',
      action: 'find',
      input: { _id: { $in: ids } },
      defaultValue: [],
    })) as SalesDeal[];

    for (const deal of deals || []) {
      const stageId = configStageId || deal.stageId;

      if (!stageId) {
        result.skipped.push(deal._id);
        continue;
      }

      const saleConfig = (await models.Configs.getConfigValue(
        'syncDeal',
        stageId,
      )) as DealSyncConfig | null;
      const returnConfig = (await models.Configs.getConfigValue(
        'syncDealReturn',
        stageId,
      )) as DealReturnSyncConfig | null;

      const config =
        saleConfig?.stageId === stageId
          ? saleConfig
          : returnConfig?.stageId === stageId
            ? returnConfig
            : null;

      if (!config) {
        result.skipped.push(deal._id);
        continue;
      }

      try {
        if (returnConfig?.stageId === stageId && config === returnConfig) {
          await dealToReturnTrs({
            models,
            userId: user?._id,
            deal,
            config: returnConfig,
          });
        } else {
          await dealToTrs({
            subdomain,
            models,
            userId: user?._id,
            deal,
            config: config as DealSyncConfig,
          });
        }

        await setDealAccountingResponse({
          subdomain,
          dealId: deal._id,
          responseFieldId: config.responseFieldId,
          message: 'success',
          userId: user?._id,
        });
        result.success.push(deal._id);
      } catch (error) {
        const message = getErrorMessage(error);

        await setDealAccountingResponse({
          subdomain,
          dealId: deal._id,
          responseFieldId: config.responseFieldId,
          message,
          userId: user?._id,
        });
        result.error.push(deal._id);
      }
    }

    return result;
  },

  async accountingSyncOrders(
    _root: undefined,
    { orderIds, posId }: { orderIds?: string[]; posId?: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingConfigs');

    const result = createResult();
    const ids = orderIds || [];

    if (!ids.length) {
      return result;
    }

    const orders = (await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'orders',
      action: 'find',
      input: { _id: { $in: ids } },
      defaultValue: [],
    })) as PosOrder[];

    for (const order of orders || []) {
      const configPosId = posId || order.posId;

      if (!configPosId) {
        result.skipped.push(order._id);
        continue;
      }

      const config = (await models.Configs.getConfigValue(
        'syncOrder',
        configPosId,
      )) as OrderSyncConfig | null;

      if (!config?.posId || config.posId !== configPosId) {
        result.skipped.push(order._id);
        continue;
      }

      try {
        if (order.status === 'return') {
          await orderToReturnTrs({
            models,
            userId: user?._id,
            order,
            config: config as unknown as OrderReturnSyncConfig,
          });
        } else {
          await orderToTrs({
            subdomain,
            models,
            userId: user?._id,
            order,
            config,
          });
        }

        await setOrderAccountingResponse({
          subdomain,
          orderId: order._id,
          message: 'success',
        });
        result.success.push(order._id);
      } catch (error) {
        await setOrderAccountingResponse({
          subdomain,
          orderId: order._id,
          message: getErrorMessage(error),
        });
        result.error.push(order._id);
      }
    }

    return result;
  },
};
// #endregion Mutations
export default checkSyncedMutations