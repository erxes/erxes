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
  setOrderAccountingResponse,
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
  returnType?: 'delete' | 'fullTr' | 'onlySale';
};

type OrderReturnSyncConfig = Parameters<
  typeof orderToReturnTrs
>[0]['config'] & {
  posId?: string;
};

type AccountingConfigDocument<TConfig> = {
  _id: string;
  code: string;
  subId?: string;
  value?: TConfig;
};

// #region Mutations
const checkSyncedMutations = {
  async accountingCheckSynced(
    _root: undefined,
    { ids, contentType }: { ids?: string[]; contentType?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAccountingCheckSync');

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
    {
      dealIds,
      ruleId,
      dateType,
    }: { dealIds?: string[]; ruleId?: string; dateType?: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingCheckSync');

    const result = createResult();
    const ids = dealIds || [];

    if (!ids.length) {
      return result;
    }

    if (!ruleId) {
      result.skipped.push(...ids);
      return result;
    }

    const rule = (await models.Configs.getConfigDetail(
      ruleId,
    )) as AccountingConfigDocument<DealSyncConfig | DealReturnSyncConfig>;

    if (!['syncDeal', 'syncDealReturn'].includes(rule.code) || !rule.value) {
      result.skipped.push(...ids);
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
      const config = rule.value;

      try {
        if (rule.code === 'syncDealReturn') {
          await dealToReturnTrs({
            models,
            userId: user?._id,
            deal,
            config: config as DealReturnSyncConfig,
            dateType,
          });
        } else {
          await dealToTrs({
            subdomain,
            models,
            userId: user?._id,
            deal,
            config: config as DealSyncConfig,
            dateType,
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
    { orderIds, ruleId }: { orderIds?: string[]; ruleId?: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccountingCheckSync');

    const result = createResult();
    const ids = orderIds || [];

    if (!ids.length) {
      return result;
    }

    if (!ruleId) {
      result.skipped.push(...ids);
      return result;
    }

    const rule = (await models.Configs.getConfigDetail(
      ruleId,
    )) as AccountingConfigDocument<OrderSyncConfig>;

    if (rule.code !== 'syncOrder' || !rule.value) {
      result.skipped.push(...ids);
      return result;
    }

    const config = rule.value;
    const returnConfig: OrderReturnSyncConfig = {
      dateRule: config.dateRule,
      defaultPayment: config.defaultPayment,
      posId: config.posId,
      returnType: config.returnType || 'fullTr',
      trStatus: config.trStatus,
    };

    const orders = (await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'orders',
      action: 'find',
      input: { _id: { $in: ids } },
      defaultValue: [],
    })) as PosOrder[];

    for (const order of orders || []) {
      try {
        if (order.status === 'return') {
          await orderToReturnTrs({
            models,
            userId: user?._id,
            order,
            config: returnConfig,
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
export default checkSyncedMutations;
