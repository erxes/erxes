import * as _ from 'underscore';

import {
  ISettlePaymentParams,
  getStatus,
} from './graphql/resolvers/mutations/orders';

import moment from 'moment';
import { productSchema } from '~/modules/posclient/db/definitions/products';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IOrderDocument } from '~/modules/posclient/@types/orders';
import { IModels } from '~/connectionResolvers';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import {
  BILL_TYPES,
  SUBSCRIPTION_INFO_STATUS,
} from '~/modules/posclient/db/definitions/constants';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { fetchEs, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IDoc } from '~/modules/posclient/db/models/PutData';
import {
  checkOrderStatus,
  prepareEbarimtData,
  validateOrderPayment,
} from '~/modules/posclient/utils/orderUtils';

export interface ICountBy {
  [index: string]: number;
}

export const getEsTypes = () => {
  const schema = productSchema;

  const typesMap: { [key: string]: any } = {};

  schema.eachPath((name) => {
    const path = schema.paths[name];
    typesMap[name] = path.options.esType;
  });

  return typesMap;
};

export const countBySegment = async (
  subdomain: string,
  contentType: string,
  qb,
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  let segments: any[] = [];

  // segments = await sendCoreMessage({
  //   subdomain,
  //   action: 'segmentFind',
  //   data: { contentType, name: { $exists: true } },
  //   isRPC: true,
  //   defaultValue: [],
  // });
  segments = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'core',
    action: 'segmentFind',
    input: { contentType, name: { $exists: true } },
    defaultValue: [],
  });

  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debugError(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export const countByTag = async (
  subdomain: string,
  type: string,
  qb,
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // const tags = await sendCoreMessage({
  //   subdomain,
  //   action: 'tagFind',
  //   data: { type },
  //   isRPC: true,
  //   defaultValue: [],
  // });
  const tags = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'core',
    action: 'tagFind',
    input: { data: { type } },
    defaultValue: [],
  });
  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries('count');
  }

  return counts;
};

export interface IListArgs {
  segment?: string;
  segmentData?: string;
}

export class Builder {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: 'products';

  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    this.contentType = 'products';
    this.context = context;
    this.params = params;
    this.models = models;
    this.subdomain = subdomain;

    this.positiveList = [];
    this.negativeList = [];

    this.resetPositiveList();
    this.resetNegativeList();
  }

  public resetNegativeList() {
    this.negativeList = [{ term: { status: 'deleted' } }];
  }

  public resetPositiveList() {
    this.positiveList = [];

    if (this.context.commonQuerySelectorElk) {
      this.positiveList.push(this.context.commonQuerySelectorElk);
    }
  }

  // filter by segment
  public async segmentFilter(segment: any, segmentData?: any) {
    // const selector = await fetchSegment(
    //   this.subdomain,
    //   segment._id,
    //   { returnSelector: true },
    //   segmentData,
    // );
    const selector = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'segments',
      action: 'fetchSegment',
      input: {
        segmentId: segment._id,
        options: segmentData,
      },
      defaultValue: [],
    });
    this.positiveList = [...this.positiveList, selector];
  }

  public getRelType() {
    return 'product';
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    // filter by segment data
    if (this.params.segmentData) {
      const segment = JSON.parse(this.params.segmentData);

      await this.segmentFilter({}, segment);
    }

    // filter by segment
    if (this.params.segment) {
      // const segment = await sendCoreMessage({
      //   isRPC: true,
      //   action: 'segmentFindOne',
      //   subdomain: this.subdomain,
      //   data: { _id: this.params.segment },
      // });

      const segment = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'core',
        action: 'segmentFindOne',
        input: { data: { _id: this.params.segment } },
        defaultValue: [],
      });

      await this.segmentFilter(segment);
    }
  }

  public async runQueries(action = 'search'): Promise<any> {
    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          must_not: this.negativeList,
        },
      },
    };

    let totalCount = 0;

    const totalCountResponse = await fetchEs({
      subdomain: this.subdomain,
      action: 'count',
      index: this.contentType,
      body: queryOptions,
      defaultValue: 0,
    });

    totalCount = totalCountResponse.count;

    const response = await fetchEs({
      subdomain: this.subdomain,
      action: 'search', // todo:action
      index: this.contentType,
      body: queryOptions,
    });

    const list = response.hits.hits.map((hit) => {
      return {
        _id: hit._id,
        ...hit._source,
      };
    });

    return {
      list,
      totalCount,
    };
  }
}

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
      // sendPosMessage({
      //   subdomain,
      //   action: 'createOrUpdateOrders',
      //   data: {
      //     posToken,
      //     action: 'makePayment',
      //     order,
      //     items,
      //   },
      // });
      sendTRPCMessage({
        pluginName: 'sales',
        module: 'pos',
        action: 'createOrUpdateOrders',
        input: {
          data: {
            posToken,
            action: 'makePayment',
            order,
            items,
          },
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

  await validateOrderPayment(order, { billType });
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
        putData && ebarimtResponses.push(putData);
        innerData && ebarimtResponses.push(innerData);
      } catch (e) {
        ebarimtResponses.push({
          _id: `Err${Math.random()}`,
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
        // uoms = await sendCoreMessage({
        //   subdomain,
        //   action: 'uoms.find',
        //   data: {
        //     code: { $in: products.map((product) => product?.uom) },
        //   },
        //   isRPC: true,
        //   defaultValue: [],
        // });
        uoms = await sendTRPCMessage({
          pluginName: 'core',
          module: 'product',
          action: 'uoms.find',
          input: {
            data: {
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

    try {
      // sendPosMessage({
      //   subdomain,
      //   action: 'createOrUpdateOrders',
      //   data: {
      //     posToken: config.token,
      //     action: 'makePayment',
      //     responses: ebarimtResponses,
      //     order,
      //     items,
      //   },
      // });
      await sendTRPCMessage({
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
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }

    return ebarimtResponses;
  } catch (e) {
    debugError(e);

    return e;
  }
};
function debugError(arg0: string) {
  throw new Error('Function not implemented.');
}
