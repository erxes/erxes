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
  SUBSCRIPTION_INFO_STATUS,
} from '~/modules/posclient/db/definitions/constants';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IDoc } from '~/modules/posclient/db/models/PutData';
import {
  checkOrderStatus,
  prepareEbarimtData,
  validateOrderPayment,
} from '~/modules/posclient/utils/orderUtils';
import * as crypto from 'node:crypto';
import { debugError } from '~/modules/posclient/debugError';

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
    const page: { ids?: string[]; cursor?: string } = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'segment',
      action: 'fetchSegment',
      input: { segmentId, cursor, limit: 1000 },
      defaultValue: { ids: [] },
    });

    ids.push(...(page.ids || []));
    cursor = page.cursor;
  } while (cursor);

  return ids;
};

export const updateMobileAmount = async (
  subdomain: string,
  models: IModels,
  paymentParams: any[],
) => {
  const firstData = (paymentParams || [])[0] || {};
  const { contentTypeId } = firstData;
  const { posToken } = firstData.data;
  const orderSelector = { _id: contentTypeId, posToken };

  const conf = await models.Configs.findOne({ token: posToken });
  if (!conf) {
    debugError(`Error occurred while sending data to erxes: config not found`);
    return;
  }

  for (const payData of paymentParams) {
    const { contentTypeId, amount, _id } = payData;
    const { posToken } = payData.data;

    if (
      orderSelector._id !== contentTypeId ||
      orderSelector.posToken !== posToken
    ) {
      continue;
    }

    await models.Orders.updateOne(orderSelector, {
      $addToSet: { mobileAmounts: { _id, amount } },
    });
  }

  let order = await models.Orders.findOne(orderSelector).lean();

  if (!order) {
    throw new Error(`Order not found`);
  }

  const sumMobileAmount = (order.mobileAmounts || []).reduce(
    (sum, i) => sum + i.amount,
    0,
  );

  await models.Orders.updateOne(orderSelector, {
    $set: { mobileAmount: sumMobileAmount },
  });

  order = await models.Orders.findOne(orderSelector).lean();

  if (!order) {
    throw new Error(`Order not found`);
  }

  const { totalAmount, registerNumber, _id } = order;
  let billType = order.billType;

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
  console.log('[SETTLE CHECK]', {
    totalAmount,
    sumMobileAmount,
    billType,
    registerNumber,
  });
  if (Math.round(totalAmount) === Math.round(sumMobileAmount)) {
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

export const prepareSettlePayment = async (
  subdomain: string,
  models: IModels,
  order: IOrderDocument,
  config: IConfigDocument,
  { _id, billType, registerNumber }: ISettlePaymentParams,
  user?: IPosUserDocument,
) => {
  checkOrderStatus(order);

  const items = await models.OrderItems.find({
    orderId: order._id,
  }).lean();

  validateOrderPayment(order, { billType });
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
        },
      );
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
