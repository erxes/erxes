import {
  ISettlePaymentParams,
  getStatus,
} from './graphql/resolvers/mutations/orders';
import moment from 'moment';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IOrderDocument } from '~/modules/posclient/@types/orders';
import { IModels } from '~/connectionResolvers';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import {
  BILL_TYPES,
  ORDER_INVOICE_CONTENT_TYPES,
  ORDER_SALE_STATUS,
  SUBSCRIPTION_INFO_STATUS,
} from '~/modules/posclient/db/definitions/constants';
import {
  ExpectedError,
  graphqlPubsub,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IDoc } from '~/modules/posclient/db/models/PutData';
import {
  checkOrderLines,
  checkOrderStatus,
  checkOrderType,
  prepareEbarimtData,
  validateOrderPayment,
} from '~/modules/posclient/utils/orderUtils';
import * as crypto from 'node:crypto';
import { debugError } from '~/modules/posclient/debugError';

const SETTLE_WAIT_MS = 500;
const SETTLE_WAIT_ATTEMPTS = 20;
const SETTLE_CLAIM_MS = 60 * 1000;
const PORTAL_BILL_TYPES = [BILL_TYPES.CITIZEN, BILL_TYPES.ENTITY];

export interface ICountBy {
  [index: string]: number;
}

/**
 * The ids of the products a segment currently holds.
 *
 * Membership is materialised in core, so this reads the settled member list
 * rather than re-running the definition. POS keeps its own copy of products
 * and does not carry `segmentIds`, so the ids have to come across the wire.
 */
export const segmentProductIds = async (
  subdomain: string,
  segmentId: string,
): Promise<string[]> => {
  const ids: string[] = [];
  let cursor: string | undefined;

  do {
    const page: { ids?: string[]; nextCursor?: string } = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'segment',
      action: 'fetchSegment',
      input: { segmentId, cursor, limit: 1000 },
      defaultValue: { ids: [] },
    });

    ids.push(...(page.ids || []));
    cursor = page.nextCursor;
  } while (cursor);

  return ids;
};

const getSettleBillType = (order: IOrderDocument) => {
  if (order.userId) {
    return order.billType;
  }

  if (order.billType === BILL_TYPES.ENTITY && !order.registerNumber) {
    return BILL_TYPES.CITIZEN;
  }

  return order.billType || BILL_TYPES.CITIZEN;
};

const isMobileCovered = (mobileAmount: number, totalAmount: number) =>
  Math.round(mobileAmount) >= Math.round(totalAmount);

const getAppliedMobileAmount = (
  order: IOrderDocument,
  sumMobileAmount: number,
) => {
  if (!isMobileCovered(sumMobileAmount, order.totalAmount)) {
    return sumMobileAmount;
  }

  const otherAmount = (order.paidAmounts || []).reduce(
    (sum, i) => sum + Number(i.amount),
    order.cashAmount || 0,
  );

  return Math.max(order.totalAmount - otherAmount, 0);
};

export const claimSettlement = (models: IModels, _id: string) =>
  models.Orders.findOneAndUpdate(
    {
      _id,
      paidDate: null,
      $or: [
        { settlingAt: null },
        { settlingAt: { $lt: new Date(Date.now() - SETTLE_CLAIM_MS) } },
      ],
    },
    { $set: { settlingAt: new Date() } },
  ).lean();

export const releaseSettlement = (models: IModels, _id: string) =>
  models.Orders.updateOne({ _id }, { $unset: { settlingAt: '' } });

export const updateMobileAmount = async (
  subdomain: string,
  models: IModels,
  paymentParams: any[],
  { deferReceipt = false }: { deferReceipt?: boolean } = {},
) => {
  const firstData = (paymentParams || [])[0] || {};
  const { contentTypeId } = firstData;

  let order = await models.Orders.findOne({ _id: contentTypeId }).lean();

  if (!order) {
    throw new Error(`Order not found`);
  }

  const posToken = order.posToken;
  const orderSelector = { _id: contentTypeId, posToken };

  const conf = await models.Configs.findOne({ token: posToken });
  if (!conf) {
    debugError(`Error occurred while sending data to erxes: config not found`);
    return;
  }

  for (const payData of paymentParams) {
    const { contentTypeId, amount, _id } = payData;

    if (orderSelector._id !== contentTypeId) {
      continue;
    }

    await models.Orders.updateOne(orderSelector, {
      $addToSet: { mobileAmounts: { _id, amount } },
    });
  }

  order = await models.Orders.findOne(orderSelector).lean();

  if (!order) {
    throw new Error(`Order not found`);
  }

  const sumMobileAmount = (order.mobileAmounts || []).reduce(
    (sum, i) => sum + i.amount,
    0,
  );

  await models.Orders.updateOne(orderSelector, {
    $set: {
      mobileAmount: getAppliedMobileAmount(order, sumMobileAmount),
      saleStatus: ORDER_SALE_STATUS.CONFIRMED,
    },
  });

  order = await models.Orders.findOne(orderSelector).lean();

  if (!order) {
    throw new Error(`Order not found`);
  }

  if (order.paidDate) {
    return sumMobileAmount;
  }

  const { totalAmount, registerNumber, _id } = order;
  let billType = getSettleBillType(order);

  const ebarimtConfig: any = conf.ebarimtConfig;
  if (
    !ebarimtConfig ||
    !Object.keys(ebarimtConfig) ||
    !ebarimtConfig.districtCode ||
    !ebarimtConfig.companyRD ||
    !ebarimtConfig.merchantTin
  ) {
    billType = BILL_TYPES.INNER;
  }

  const billTypeMissing =
    deferReceipt && !order.billType && billType !== BILL_TYPES.INNER;

  if (isMobileCovered(sumMobileAmount, totalAmount) && !billTypeMissing) {
    if (
      (billType === BILL_TYPES.ENTITY && registerNumber) ||
      billType === BILL_TYPES.CITIZEN ||
      billType === BILL_TYPES.INNER
    ) {
      await prepareSettlePayment(subdomain, models, order, conf, {
        _id,
        billType,
        registerNumber,
      });

      return sumMobileAmount;
    }
  }

  if (order.isPre) {
    const items = await models.OrderItems.find({ orderId: order._id });
    const config = await models.Configs.findOne({ token: posToken });
    if (config?.isOnline) {
      const products = await models.Products.find({
        _id: { $in: items.map((i) => i.productId) },
      }).lean();
      for (const item of items) {
        const product = products.find((p) => p._id === item.productId);
        item.productName = `${product?.code} - ${product?.name}`;
      }
    }

    try {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'sales',
        module: 'pos',
        action: 'createOrUpdateOrders',
        input: {
          posToken,
          action: 'makePayment',
          order,
          items,
        },
      });
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }
  }

  graphqlPubsub.publish('ordersOrdered', {
    ordersOrdered: {
      ...order,
      mobileAmount: sumMobileAmount,
      _id: order._id,
      status: order.status,
      customerId: order.customerId,
    },
  });

  return sumMobileAmount;
};

const getPaidInvoices = (subdomain: string, _id: string) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'payment',
    method: 'query',
    module: 'invoices',
    action: 'find',
    input: {
      contentTypeId: _id,
      contentType: { $in: ORDER_INVOICE_CONTENT_TYPES },
      status: 'paid',
    },
    defaultValue: [],
  });

const paymentNotConfirmed = () =>
  new ExpectedError('Order payment is not confirmed', 'FORBIDDEN');

const assertReceiptType = (order: IOrderDocument, billType: string) => {
  if (billType === BILL_TYPES.ENTITY && order.billType === BILL_TYPES.CITIZEN) {
    throw new ExpectedError(
      'Order is already settled with a citizen receipt',
      'CONFLICT',
    );
  }
};

const waitForSettlement = async (models: IModels, _id: string) => {
  for (let attempt = 0; attempt < SETTLE_WAIT_ATTEMPTS; attempt++) {
    const { paidDate, mobileAmount, totalAmount } =
      await models.Orders.getOrder(_id);

    if (paidDate || !isMobileCovered(mobileAmount || 0, totalAmount)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, SETTLE_WAIT_MS));
  }
};

export const recordPaidInvoices = async (
  subdomain: string,
  models: IModels,
  _id: string,
) => {
  const order = await models.Orders.getOrder(_id);

  if (order.paidDate) {
    return order;
  }

  const invoices = await getPaidInvoices(subdomain, _id);

  if (!invoices.length) {
    throw paymentNotConfirmed();
  }

  checkOrderType(order);

  await updateMobileAmount(subdomain, models, invoices, { deferReceipt: true });

  const recordedOrder = await models.Orders.getOrder(_id);

  if (
    recordedOrder.paidDate ||
    recordedOrder.isPre ||
    isMobileCovered(recordedOrder.mobileAmount || 0, recordedOrder.totalAmount)
  ) {
    return recordedOrder;
  }

  throw paymentNotConfirmed();
};

export const settleFromPaidInvoices = async (
  subdomain: string,
  models: IModels,
  { _id, billType, registerNumber }: ISettlePaymentParams,
) => {
  const order = await models.Orders.getOrder(_id);

  if (order.paidDate) {
    assertReceiptType(order, billType);

    return order;
  }

  const invoices = await getPaidInvoices(subdomain, _id);

  if (!invoices.length) {
    throw paymentNotConfirmed();
  }

  checkOrderType(order);

  if (!order.userId && PORTAL_BILL_TYPES.includes(billType)) {
    await models.Orders.updateOne(
      { _id, paidDate: null },
      { $set: { billType, ...(registerNumber ? { registerNumber } : {}) } },
    );
  }

  await updateMobileAmount(subdomain, models, invoices);
  await waitForSettlement(models, _id);

  const settledOrder = await models.Orders.getOrder(_id);

  if (!settledOrder.paidDate) {
    throw paymentNotConfirmed();
  }

  assertReceiptType(settledOrder, billType);

  return settledOrder;
};

export const prepareSettlePayment = async (
  subdomain: string,
  models: IModels,
  order: IOrderDocument,
  config: IConfigDocument,
  { _id, billType, registerNumber }: ISettlePaymentParams,
  user?: IPosUserDocument,
) => {
  checkOrderStatus(order);

  if (!(await claimSettlement(models, _id))) {
    if (user) {
      throw new ExpectedError('Order is being settled', 'CONFLICT');
    }

    return [];
  }

  const now = new Date();

  const ebarimtConfig: any = config.ebarimtConfig;

  if (
    !ebarimtConfig ||
    !Object.keys(ebarimtConfig) ||
    !ebarimtConfig.districtCode ||
    !ebarimtConfig.companyRD ||
    !ebarimtConfig.merchantTin
  ) {
    billType = BILL_TYPES.INNER;
  }

  try {
    order = await models.Orders.getOrder(_id);

    const items = await models.OrderItems.find({
      orderId: order._id,
    }).lean();

    checkOrderType(order);
    checkOrderLines(order, items);
    validateOrderPayment(order, { billType });

    const ebarimtResponses: any[] = [];

    if (billType !== BILL_TYPES.INNER) {
      const ebarimtData: IDoc = await prepareEbarimtData(
        models,
        order,
        ebarimtConfig,
        items,
        config.paymentTypes,
        billType,
        registerNumber,
      );

      try {
        const { putData, innerData } = await models.PutResponses.putData(
          { ...ebarimtData },
          ebarimtConfig,
          config.token,
          user,
        );
        if (putData) {
          ebarimtResponses.push(putData);
        }
        if (innerData) {
          ebarimtResponses.push(innerData);
        }
      } catch (e) {
        ebarimtResponses.push({
          _id: `Err${cryptoRandom()}`,
          id: 'Error',
          type: ebarimtData.type,
          date: moment(new Date()).format('"yyyy-MM-dd HH:mm:ss'),
          status: 'ERROR',
          contentType: 'pos',
          contentId: order._id,
          number: order.number ?? '',
          userId: user?._id,
          billId: 'Error',
          success: 'false',
          message: e.message,
        });
      }
    }

    if (
      billType === BILL_TYPES.INNER ||
      (ebarimtResponses.length &&
        !ebarimtResponses.filter((er) => er.status !== 'SUCCESS').length)
    ) {
      await models.Orders.updateOne(
        { _id },
        {
          $set: {
            billType,
            registerNumber,
            paidDate: now,
            modifiedAt: now,
            status: getStatus(
              config,
              'settle',
              { ...order, paidDate: now },
              { ...order },
            ),
          },
          $unset: { settlingAt: '' },
        },
      );
    } else {
      await releaseSettlement(models, _id);
    }

    order = await models.Orders.getOrder(_id);

    graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id,
        status: order.status,
        customerId: order.customerId,
      },
    });

    if (config.isOnline) {
      const products = await models.Products.find({
        _id: { $in: items.map((i) => i.productId) },
      }).lean();

      let uoms: any[] = [];

      if (products.find((product) => product?.type === 'subscription')) {
        uoms = await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          module: 'productUoms',
          action: 'find',
          input: {
            query: {
              code: { $in: products.map((product) => product?.uom) },
            },
          },
        });
      }

      for (const item of items) {
        const product = products.find((p) => p._id === item.productId);
        item.productName = `${product?.code} - ${product?.name}`;

        const uom = uoms.find((uom) => uom?.code === product?.uom);

        if (
          product?.type === 'subscription' &&
          order?.subscriptionInfo?.status === SUBSCRIPTION_INFO_STATUS.ACTIVE &&
          uom
        ) {
          const { isForSubscription, subscriptionConfig = {} } = uom || {};

          const {
            rule,
            subsRenewable,
            period: periodConfig,
          } = subscriptionConfig;

          if (isForSubscription && rule === 'startPaidDate' && !subsRenewable) {
            const period = (periodConfig || '').replace('ly', '');

            if (period) {
              item.closeDate = new Date(
                moment()
                  .add(item?.count || 0, period)
                  .toISOString(),
              );
            }
          }

          if (subsRenewable && order?.subscriptionInfo?.prevSubscriptionId) {
            const prevSubscriptionId =
              order?.subscriptionInfo?.prevSubscriptionId;

            await models.Orders.updateOne(
              { _id: prevSubscriptionId },
              { 'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.DONE },
            );
            // await sendPosMessage({
            //   subdomain,
            //   action: 'orders.updateOne',
            //   data: {
            //     selector: { _id: prevSubscriptionId },
            //     modifier: {
            //       'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.DONE,
            //     },
            //   },
            //   isRPC: true,
            //   defaultValue: null,
            // });
            uoms = await sendTRPCMessage({
              subdomain,

              pluginName: 'sales',
              module: 'pos',
              action: 'orders.updateOne',
              input: {
                selector: { _id: prevSubscriptionId },
                modifier: {
                  'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.DONE,
                },
              },
            });
          }
        }
      }
    }

    sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'sales',
      module: 'pos',
      action: 'createOrUpdateOrders',
      input: {
        posToken: config.token,
        action: 'makePayment',
        responses: ebarimtResponses,
        order,
        items,
      },
    });

    return ebarimtResponses;
  } catch (e) {
    await releaseSettlement(models, _id);

    debugError(e);

    return e;
  }
};

export function cryptoRandom() {
  // Generate a random 6-byte buffer (48 bits of entropy)
  const randomBuffer = crypto.randomBytes(6);
  // Convert to a number between 0 and 1
  const randomNumber = randomBuffer.readUIntBE(0, 6) / 0x1000000000000; // 2^48
  return randomNumber;
}
