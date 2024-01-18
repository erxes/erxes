import { debug } from './configs';
import * as _ from 'underscore';
import { IModels } from './connectionResolver';
import {
  fetchSegment,
  sendPosMessage,
  sendSegmentsMessage,
  sendTagsMessage,
} from './messageBroker';
import { productSchema } from './models/definitions/products';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { BILL_TYPES } from './models/definitions/constants';
import {
  checkOrderStatus,
  getDistrictName,
  prepareEbarimtData,
  validateOrderPayment,
} from './graphql/utils/orderUtils';
import { PutData } from './models/PutData';
import {
  ISettlePaymentParams,
  getStatus,
} from './graphql/resolvers/mutations/orders';
import { debugError } from '@erxes/api-utils/src/debuggers';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

type TSortBuilder = { primaryName: number } | { [index: string]: number };

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

  segments = await sendSegmentsMessage({
    subdomain,
    action: 'find',
    data: { contentType, name: { $exists: true } },
    isRPC: true,
    defaultValue: [],
  });

  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debug.error(`Error during segment count ${e.message}`);
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

  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: { type },
    isRPC: true,
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
    const selector = await fetchSegment(
      this.subdomain,
      segment._id,
      { returnSelector: true },
      segmentData,
    );

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
      const segment = await sendSegmentsMessage({
        isRPC: true,
        action: 'findOne',
        subdomain: this.subdomain,
        data: { _id: this.params.segment },
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
      action,
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
  const sumMobileAmount = (order.mobileAmounts || []).reduce(
    (sum, i) => sum + i.amount,
    0,
  );

  await models.Orders.updateOne(orderSelector, {
    $set: { mobileAmount: sumMobileAmount },
  });

  order = await models.Orders.findOne(orderSelector).lean();

  const { billType, totalAmount, registerNumber, _id } = order;

  if (Math.round(totalAmount) === Math.round(sumMobileAmount)) {
    if (
      (billType === BILL_TYPES.ENTITY && registerNumber) ||
      billType === BILL_TYPES.CITIZEN ||
      billType === BILL_TYPES.INNER
    ) {
      const conf = await models.Configs.findOne({ token: posToken });
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
        const product = products.find((p) => p._id === item.productId) || {};
        item.productName = `${product.code} - ${product.name}`;
      }
    }

    try {
      sendPosMessage({
        subdomain,
        action: 'createOrUpdateOrders',
        data: {
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
  subdomain,
  models,
  order,
  config,
  { _id, billType, registerNumber }: ISettlePaymentParams,
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
    !ebarimtConfig.companyRD
  ) {
    billType = BILL_TYPES.INNER;
  }

  try {
    const ebarimtResponses: any[] = [];

    if (billType !== BILL_TYPES.INNER) {
      const ebarimtDatas = await prepareEbarimtData(
        models,
        order,
        ebarimtConfig,
        items,
        billType,
        registerNumber,
        config.paymentTypes,
      );

      ebarimtConfig.districtName = getDistrictName(
        (ebarimtConfig && ebarimtConfig.districtCode) || '',
      );

      for (const data of ebarimtDatas) {
        let response;

        if (data.inner) {
          const putData = new PutData({
            ...config,
            ...data,
            config,
            models,
          });

          response = {
            _id: Math.random(),
            billId: 'Түр баримт',
            ...(await putData.generateTransactionInfo()),
            registerNo: ebarimtConfig.companyRD || '',
            success: 'true',
          };
          ebarimtResponses.push(response);

          await models.OrderItems.updateOne(
            { _id: { $in: data.itemIds } },
            { $set: { isInner: true } },
          );

          continue;
        }

        response = await models.PutResponses.putData({
          ...data,
          config: ebarimtConfig,
          models,
        });
        ebarimtResponses.push(response);
      }
    }

    if (
      billType === BILL_TYPES.INNER ||
      (ebarimtResponses.length &&
        !ebarimtResponses.filter((er) => er.success !== 'true').length)
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
      for (const item of items) {
        const product = products.find((p) => p._id === item.productId) || {};
        item.productName = `${product.code} - ${product.name}`;
      }
    }

    try {
      sendPosMessage({
        subdomain,
        action: 'createOrUpdateOrders',
        data: {
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
