import {
  BILL_TYPES,
  ORDER_ITEM_STATUSES,
  ORDER_SALE_STATUS,
  ORDER_STATUSES,
  ORDER_TYPES,
} from '@/posclient/db/definitions/constants';

import { IDoc } from '@/posclient/db/models/PutData';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  checkCouponCode,
  checkOrderAmount,
  checkOrderStatus,
  checkScoreAviableSubtractScoreCampaign,
  cleanOrderItems,
  generateOrderNumber,
  getTotalAmount,
  prepareEbarimtData,
  prepareOrderDoc,
  reverseItemStatus,
  updateOrderItems,
  validateOrder,
  validateOrderPayment,
} from '@/posclient/utils/orderUtils';
import {
  graphqlPubsub,
  getPureDate,
  sendTRPCMessage,
  markResolvers,
} from 'erxes-api-shared/utils';
import { IContext, IOrderInput } from '@/posclient/@types/types';
import { IConfig, IConfigDocument } from '~/modules/posclient/@types/configs';
import { IOrder, IPaidAmount } from '~/modules/posclient/@types/orders';
import {
  ICartChangeLogInput,
  IOrderChangeEntry,
} from '~/modules/posclient/@types/orderChangeLogs';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import { IOrderItemInput } from '~/modules/posclient/@types/types';
import { checkSlotStatus } from '~/modules/posclient/utils/slots';
import { IModels } from '~/connectionResolvers';
import { prepareSettlePayment } from '~/modules/posclient/utils';
import { debugError } from '~/modules/posclient/debugError';
import { assertPosUser } from '~/modules/posclient/utils/assertPosUser';
import { cancelPosOrder } from '~/modules/posclient/utils/cancelOrder';
import {
  getOrderChangeSnapshot,
  saveOrderChangeSnapshot,
} from '~/modules/posclient/utils/orderChangeLogs';

interface IPaymentBase {
  billType: string;
  registerNumber?: string;
}

export interface ISettlePaymentParams extends IPaymentBase {
  _id: string;
}

export interface IPayment extends IPaymentBase {
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: IPaidAmount[];
}

interface IPaymentParams {
  _id: string;
  doc: IPayment;
}

interface IOrderEditParams extends IOrderInput {
  _id: string;
  billType?: string;
  registerNumber?: string;
}

export interface IOrderChangeParams {
  _id: string;
  dueDate?: Date;
  branchId?: string;
  deliveryInfo?: unknown;
  description?: string;
}

type EditableOrderChangeField =
  | 'dueDate'
  | 'branchId'
  | 'deliveryInfo'
  | 'description';

const normalizeDateChangeValue = (value: unknown) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? value : date.toISOString();
  }

  return value ?? null;
};

const normalizeChangeValue = (
  field: EditableOrderChangeField,
  value: unknown,
) => (field === 'dueDate' ? normalizeDateChangeValue(value) : (value ?? null));

const valuesAreEqual = (
  field: EditableOrderChangeField,
  oldValue: unknown,
  newValue: unknown,
) =>
  JSON.stringify(normalizeChangeValue(field, oldValue)) ===
  JSON.stringify(normalizeChangeValue(field, newValue));

const getOrderChangeValue = (
  order: IOrder,
  field: EditableOrderChangeField,
  config: IConfigDocument,
) => {
  if (field === 'branchId') {
    return config.branchId ? order.subBranchId : order.branchId;
  }

  return order[field];
};

const buildOrderChangeEntries = (
  order: IOrder,
  params: IOrderChangeParams,
  config: IConfigDocument,
): IOrderChangeEntry[] => {
  const fields: EditableOrderChangeField[] = [
    'dueDate',
    'branchId',
    'deliveryInfo',
    'description',
  ];

  return fields.reduce<IOrderChangeEntry[]>((entries, field) => {
    const newValue = params[field];

    if (newValue === undefined) {
      return entries;
    }

    const oldValue = getOrderChangeValue(order, field, config);

    if (valuesAreEqual(field, oldValue, newValue)) {
      return entries;
    }

    return [...entries, { field, oldValue, newValue }];
  }, []);
};

const getTaxInfo = (config: IConfig) => {
  return {
    hasVat: config.ebarimtConfig?.hasVat || false,
    hasCitytax: config.ebarimtConfig?.hasCitytax || false,
  };
};

export const getStatus = (config, buttonType, doc, order?) => {
  if (doc.isPre) {
    return ORDER_STATUSES.PENDING;
  }

  if (!config?.kitchenScreen?.isActive) {
    return ORDER_STATUSES.COMPLETE;
  }

  const type = config.kitchenScreen.showType;

  if (
    order?.status &&
    type === 'paid' &&
    order.status === ORDER_STATUSES.PENDING &&
    doc.paidDate &&
    !order.isPre
  ) {
    return ORDER_STATUSES.NEW;
  }

  if (
    order?.status &&
    [ORDER_STATUSES.COMPLETE, ORDER_STATUSES.DONE].includes(order.status) &&
    doc?.items?.length
  ) {
    const newItems =
      doc.items.filter((i) => i.status === ORDER_ITEM_STATUSES.NEW) || [];
    if (newItems.length) {
      return ORDER_STATUSES.REDOING;
    }
  }

  if (order?.status) {
    return order.status;
  }
  if (type === 'click' && buttonType !== 'order') {
    return ORDER_STATUSES.COMPLETE;
  }

  if (type === 'paid' && !order?.paidDate) {
    return ORDER_STATUSES.PENDING;
  }

  return ORDER_STATUSES.NEW;
};

export const getSaleStatus = (config, doc, order) => {
  if (order.saleStatus) {
    if (order.saleStatus === ORDER_SALE_STATUS.CONFIRMED) {
      return ORDER_SALE_STATUS.CONFIRMED;
    }
    return ORDER_SALE_STATUS.CART;
  }
  return ORDER_SALE_STATUS.CART;
};

const orderAdd = async (models: IModels, lastDoc, config) => {
  try {
    const number = await generateOrderNumber(models, config);

    const order = await models.Orders.createOrder({
      ...lastDoc,
      number,
    });

    return order;
  } catch (e) {
    if (e.message.includes(`E11000 duplicate key error`)) {
      return await orderAdd(models, lastDoc, config);
    } else {
      throw new Error(e.message);
    }
  }
};

export const ordersAdd = async (
  doc: IOrderInput,
  {
    posUser,
    config,
    models,
    subdomain,
  }: {
    posUser?: IPosUserDocument;
    config: IConfigDocument;
    models: IModels;
    subdomain: string;
  },
) => {
  const { totalAmount, type, customerId, customerType, branchId, isPre } = doc;

  await validateOrder(subdomain, models, config, doc);

  const orderDoc = {
    totalAmount,
    type,
    branchId,
    customerId,
    customerType,
    userId: posUser ? posUser._id : '',
    isPre,
  };

  try {
    const preparedDoc = await prepareOrderDoc(
      subdomain,
      doc,
      config,
      models,
      posUser,
    );

    const status = getStatus(config, doc.buttonType, doc);
    const saleStatus = getSaleStatus(config, doc, preparedDoc);

    const lastDoc = {
      ...doc,
      ...orderDoc,
      totalAmount: getTotalAmount(preparedDoc.items),
      branchId: config.branchId || doc.branchId,
      subBranchId: doc.branchId,
      posToken: config.token,
      departmentId: config.departmentId,
      taxInfo: getTaxInfo(config),
      status,
      saleStatus,
      subscriptionInfo: preparedDoc?.subscriptionInfo,
      extraInfo: {
        rawTotalAmount: doc.totalAmount,
        couponCode: doc.couponCode,
        voucherId: doc.voucherId,
      },
    };

    const order = await orderAdd(models, lastDoc, config);

    for (const item of preparedDoc.items) {
      await models.OrderItems.createOrderItem({
        count: item.count,
        productId: item.productId,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        discountInfos: item.discountInfos,
        bonusCount: item.bonusCount,
        bonusVoucherId: item.bonusVoucherId,
        orderId: order._id,
        isPackage: item.isPackage,
        isTake: item.isTake,
        status: ORDER_ITEM_STATUSES.NEW,
        manufacturedDate: item.manufacturedDate,
        description: item.description,
        attachment: item.attachment,
        closeDate: item?.closeDate,
      });
    }

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id: order._id,
        status: order.status,
        customerId: order.customerId,
        customerType: order.customerType,
      },
    });

    if (order.slotCode) {
      const currentSlots = await models.PosSlots.find({
        posToken: config.token,
        code: order.slotCode,
      }).lean();

      if (currentSlots.length) {
        await graphqlPubsub.publish('slotsStatusUpdated', {
          slotsStatusUpdated: await checkSlotStatus(
            models,
            config,
            currentSlots,
          ),
        });
      }
    }

    return order;
  } catch (e) {
    debugError(
      `Error occurred when creating order: ${JSON.stringify(orderDoc)}`,
    );

    return e;
  }
};

export const ordersEdit = async (
  doc: IOrderEditParams,
  {
    posUser,
    config,
    models,
    subdomain,
  }: {
    posUser?: IPosUserDocument;
    config: IConfigDocument;
    models: IModels;
    subdomain: string;
  },
) => {
  const order = await models.Orders.getOrder(doc._id);

  checkOrderStatus(order);

  await validateOrder(subdomain, models, config, doc, order);

  const before = await getOrderChangeSnapshot(models, doc._id);

  await cleanOrderItems(doc._id, doc.items, models);

  const preparedDoc = await prepareOrderDoc(
    subdomain,
    doc,
    config,
    models,
    posUser,
  );

  preparedDoc.items = await reverseItemStatus(models, preparedDoc.items);

  await updateOrderItems(doc._id, preparedDoc.items, models);

  const status = getStatus(config, doc.buttonType, doc, order);
  const saleStatus = getSaleStatus(config, doc, preparedDoc);

  // don't change isPre
  const updatedOrder = await models.Orders.updateOrder(doc._id, {
    deliveryInfo: doc.deliveryInfo,
    branchId: config.branchId || doc.branchId,
    subBranchId: doc.branchId,
    customerId: doc.customerId,
    customerType: doc.customerType,
    brokerId: doc.brokerId,
    brokerType: doc.brokerType,
    userId: posUser ? posUser._id : '',
    type: doc.type,
    totalAmount: getTotalAmount(preparedDoc.items),
    directDiscount: doc.directDiscount,
    directIsAmount: doc.directIsAmount,
    billType: doc.billType || BILL_TYPES.CITIZEN,
    registerNumber: doc.registerNumber || '',
    slotCode: doc.slotCode,
    posToken: config.token,
    departmentId: config.departmentId,
    taxInfo: getTaxInfo(config),
    dueDate: doc.dueDate,
    description: doc.description,
    status,
    saleStatus,
    extraInfo: {
      rawTotalAmount: doc.totalAmount,
      couponCode: doc.couponCode,
      voucherId: doc.voucherId,
    },
  });

  await saveOrderChangeSnapshot(
    models,
    doc._id,
    config.token,
    posUser?._id,
    before,
  );

  await graphqlPubsub.publish('ordersOrdered', {
    ordersOrdered: {
      ...updatedOrder,
      _id: updatedOrder._id,
      status: updatedOrder.status,
      customerId: updatedOrder.customerId,
      customerType: order.customerType,
    },
  });

  if (
    (order.slotCode || updatedOrder.slotCode) &&
    order.slotCode !== updatedOrder.slotCode
  ) {
    const currentSlots = await models.PosSlots.find({
      posToken: config.token,
      code: { $in: [order.slotCode, updatedOrder.slotCode] },
    }).lean();

    if (currentSlots.length) {
      await graphqlPubsub.publish('slotsStatusUpdated', {
        slotsStatusUpdated: await checkSlotStatus(models, config, currentSlots),
      });
    }
  }

  return updatedOrder;
};

const getItemInput = (item) => {
  return {
    ...item,
    _id: item._id,
    productId: item.productId,
    count: item.count,
    unitPrice: item.unitPrice || 0,
    isPackage: item.isPackage,
    isTake: item.isTake,
    status: item.status,
    discountPercent: item.discountPercent,
    discountAmount: item.discountAmount,
    discountInfos: item.discountInfos,
    bonusCount: item.bonusCount,
    bonusVoucherId: item.bonusVoucherId,
    manufacturedDate: item.manufacturedDate,
    description: item.description,
    attachment: item.attachment,
    closeDate: item.closeDate,
  };
};

const QR_MENU_ACTIVE_ORDER_STATUSES = [
  ORDER_STATUSES.NEW,
  ORDER_STATUSES.DOING,
  ORDER_STATUSES.DONE,
  ORDER_STATUSES.COMPLETE,
  ORDER_STATUSES.REDOING,
  ORDER_STATUSES.PENDING,
];

type OrderMutationCtx = {
  posUser?: IPosUserDocument;
  config: IConfigDocument;
  models: IModels;
  subdomain: string;
};

async function findOpenQrMenuOrderForSlot(
  models: IModels,
  config: IConfigDocument,
  slotCode: string,
) {
  return models.Orders.findOne({
    $or: [{ posToken: config.token }, { subToken: config.token }],
    paidDate: { $exists: false },
    status: { $in: QR_MENU_ACTIVE_ORDER_STATUSES },
    origin: 'qrMenu',
    slotCode,
    isSingle: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .lean();
}

async function tryMergeQrMenuIntoExistingSlotOrder(
  doc: IOrderInput,
  ctx: OrderMutationCtx,
) {
  if (!(doc.origin === 'qrMenu' && doc.isSingle === false && doc.slotCode)) {
    return null;
  }

  if (doc.deviceId) {
    doc.items = doc.items.map((i) => ({
      ...i,
      byDevice: { [doc.deviceId || '']: i.count },
    }));
  }

  const slotInSameOrder = await findOpenQrMenuOrderForSlot(
    ctx.models,
    ctx.config,
    doc.slotCode,
  );

  if (!slotInSameOrder?._id) {
    return null;
  }

  const items: IOrderItemInput[] = (
    await ctx.models.OrderItems.find({ orderId: slotInSameOrder._id }).lean()
  ).map((item) => ({ ...getItemInput(item) }));

  for (const newItem of doc.items || []) {
    const duplicatedItem = items.find(
      (i) =>
        i.productId === newItem.productId &&
        Boolean(i.isPackage) === Boolean(newItem.isPackage) &&
        Boolean(i.isTake) === Boolean(newItem.isTake),
    );

    if (duplicatedItem) {
      duplicatedItem.count += newItem.count;

      duplicatedItem.byDevice = {
        ...(duplicatedItem.byDevice || {}),
        [doc.deviceId || '']:
          (duplicatedItem.byDevice?.[doc.deviceId || ''] ?? 0) + newItem.count,
      };
    } else {
      items.push({
        ...getItemInput(newItem),
        byDevice: { [doc.deviceId || '']: newItem.count },
      });
    }
  }

  return ordersEdit({ ...doc, ...slotInSameOrder, items }, ctx);
}

async function applyOrderSaleStatusChange(
  models: IModels,
  _id: string,
  saleStatus: string,
) {
  const oldOrder = await models.Orders.getOrder(_id);

  await models.Orders.updateOrder(_id, {
    ...oldOrder,
    saleStatus,
    modifiedAt: new Date(),
  });

  return models.Orders.getOrder(_id);
}

const orderMutations: Record<string, Resolver> = {
  async posclientCartChangeLogCreate(
    _root,
    { doc }: { doc: ICartChangeLogInput },
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);
    if (!posUser) throw new Error('POS user required');
    const log = await models.OrderChangeLogs.recordCartChange(
      doc,
      config.token,
      posUser._id,
    );
    return log;
  },
  async ordersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models, subdomain }: IContext,
  ) {
    assertPosUser(posUser);

    const merged = await tryMergeQrMenuIntoExistingSlotOrder(doc, {
      posUser,
      config,
      models,
      subdomain,
    });
    if (merged) {
      return merged;
    }

    return ordersAdd(doc, { posUser, config, models, subdomain });
  },

  async cpOrdersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models, subdomain }: IContext,
  ) {
    const merged = await tryMergeQrMenuIntoExistingSlotOrder(doc, {
      posUser,
      config,
      models,
      subdomain,
    });
    if (merged) {
      return merged;
    }

    return ordersAdd(doc, { posUser, config, models, subdomain });
  },

  async cpOrdersEdit(
    _root,
    doc: IOrderEditParams,
    { posUser, config, models, subdomain }: IContext,
  ) {
    return ordersEdit(doc, { posUser, config, models, subdomain });
  },

  async ordersEdit(
    _root,
    doc: IOrderEditParams,
    { posUser, config, models, subdomain }: IContext,
  ) {
    assertPosUser(posUser);

    return ordersEdit(doc, { posUser, config, models, subdomain });
  },

  async orderChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, subdomain, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const oldOrder = await models.Orders.getOrder(_id);
    const before = await getOrderChangeSnapshot(models, _id);

    const order = await models.Orders.updateOrder(_id, {
      ...oldOrder,
      status,
      modifiedAt: new Date(),
    });

    if (status === ORDER_STATUSES.REDOING) {
      await models.OrderItems.updateMany(
        { orderId: order._id },
        { $set: { status: ORDER_ITEM_STATUSES.CONFIRM } },
      );
    }

    if (status === ORDER_STATUSES.DONE) {
      await models.OrderItems.updateMany(
        { orderId: order._id },
        { $set: { status: ORDER_ITEM_STATUSES.DONE } },
      );
    }

    await saveOrderChangeSnapshot(
      models,
      _id,
      config.token,
      posUser?._id,
      before,
    );

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id,
        status: order.status,
        customerId: order.customerId,
        customerType: order.customerType,
      },
    });

    if (
      order.type === 'delivery' &&
      order.status === ORDER_STATUSES.DONE &&
      (order.deliveryInfo || order.description) &&
      order.customerId
    ) {
      try {
        await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            query: { action: 'statusToDone', order, posToken: config.token },
          },
          defaultValue: {},
        });
      } catch (e) {
        console.error('Error confirming cover:', e);
      }
    }
    return await models.Orders.getOrder(_id);
  },

  async orderChangeSaleStatus(
    _root,
    { _id, saleStatus }: { _id: string; saleStatus: string },
    { models, posUser, config }: IContext,
  ) {
    assertPosUser(posUser);

    const before = await getOrderChangeSnapshot(models, _id);
    const order = await applyOrderSaleStatusChange(models, _id, saleStatus);
    await saveOrderChangeSnapshot(
      models,
      _id,
      config.token,
      posUser?._id,
      before,
    );
    await graphqlPubsub.publish('ordersOrdered', { ordersOrdered: order });
    return order;
  },

  async cpOrderChangeSaleStatus(
    _root,
    { _id, saleStatus }: { _id: string; saleStatus: string },
    { models }: IContext,
  ) {
    return applyOrderSaleStatusChange(models, _id, saleStatus);
  },

  async ordersChange(
    _root,
    params: IOrderChangeParams,
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    // after paid then edit order some field
    // if online, update branch
    // update dueDate
    // update deliveryInfo
    const order = await models.Orders.getOrder(params._id);

    if (!order.paidDate) {
      throw new Error('Can not change cause: order is not paid');
    }

    if (params.dueDate && params.dueDate < getPureDate(new Date())) {
      throw new Error('due date must be in future');
    }

    if (params.branchId) {
      if (!config.isOnline) {
        throw new Error('Can edit branch at only online pos');
      }

      if (!(config.allowBranchIds || []).includes(params.branchId)) {
        throw new Error('not allowed branch');
      }
    }

    const changes = buildOrderChangeEntries(order, params, config);

    const doc = { ...order };

    if (params.dueDate !== undefined) doc.dueDate = params.dueDate;

    if (params.branchId !== undefined) {
      if (config.branchId) {
        doc.subBranchId = params.branchId;
      } else {
        doc.branchId = params.branchId;
        doc.subBranchId = params.branchId;
      }
    }

    if (params.deliveryInfo !== undefined)
      doc.deliveryInfo = params.deliveryInfo;
    if (params.description !== undefined) doc.description = params.description;

    const changedOrder = await models.Orders.updateOrder(params._id, doc);

    if (changes.length) {
      await models.OrderChangeLogs.createLog({
        orderId: params._id,
        posToken: config.token,
        userId: posUser?._id,
        changes,
      });
    }

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: changedOrder,
    });

    return changedOrder;
  },

  async orderItemChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const oldOrderItem = await models.OrderItems.getOrderItem(_id);
    const orderId = oldOrderItem.orderId;
    if (!orderId) {
      throw new Error('Order item has no order');
    }
    const before = await getOrderChangeSnapshot(models, orderId);

    await models.OrderItems.updateOrderItem(_id, { ...oldOrderItem, status });

    await saveOrderChangeSnapshot(
      models,
      orderId,
      config.token,
      posUser?._id,
      before,
    );

    await graphqlPubsub.publish('orderItemsOrdered', {
      orderItemsOrdered: {
        _id,
        posToken: config.token,
        status: status,
      },
    });

    return await models.OrderItems.getOrderItem(_id);
  },
  /**
   * Веб болон мобайл дээр хэрэглээгүй бол устгана.
   */
  async ordersMakePayment(
    _root,
    { _id, doc }: IPaymentParams,
    { config, models, subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    const items = await models.OrderItems.find({
      orderId: order._id,
    }).lean();

    validateOrderPayment(order, doc);
    const now = new Date();

    const ebarimtConfig: any = config.ebarimtConfig;

    try {
      const ebarimtResponses: any[] = [];

      const ebarimtData: IDoc = await prepareEbarimtData(
        models,
        order,
        ebarimtConfig,
        items,
        config.paymentTypes,
        doc.billType,
        doc.registerNumber || order.registerNumber,
      );

      const response = await models.PutResponses.putData(
        { ...ebarimtData },
        ebarimtConfig,
        config.token,
        posUser,
      );
      ebarimtResponses.push(response);

      if (
        ebarimtResponses.length &&
        !ebarimtResponses.filter((er) => er.success !== 'true').length
      ) {
        await models.Orders.updateOne(
          { _id },
          {
            $set: {
              ...doc,
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

      try {
        await sendTRPCMessage({
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
          defaultValue: {},
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }

      return ebarimtResponses;
    } catch (e) {
      debugError(e);

      return e;
    }
  }, // end payment mutation

  async ordersAddPayment(
    _root,
    {
      _id,
      cashAmount,
      paidAmounts,
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
    },
    { models, config, subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const order = await models.Orders.getOrder(_id);

    const amount =
      (cashAmount || 0) +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

    checkOrderStatus(order);
    checkOrderAmount(order, amount);
    await checkScoreAviableSubtractScoreCampaign(
      subdomain,
      models,
      order,
      paidAmounts,
    );
    await checkCouponCode({ subdomain, order });

    const modifier: any = {
      $set: {
        cashAmount: cashAmount
          ? (order.cashAmount || 0) + Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(paidAmounts || []),
        saleStatus: ORDER_SALE_STATUS.CONFIRMED,
      },
    };

    await models.Orders.updateOne({ _id: order._id }, modifier);

    const newOrder = await models.Orders.getOrder(order._id);

    if (newOrder?.isPre) {
      const items = await models.OrderItems.find({ orderId: newOrder._id });
      if (config.isOnline) {
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
            posToken: config.token,
            action: 'makePayment',
            order,
            items,
          },
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }
    }

    return newOrder;
  },

  async cpOrdersAddPayment(
    _root,
    {
      _id,
      cashAmount,
      paidAmounts,
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
    },
    { models, config, subdomain }: IContext,
  ) {
    const order = await models.Orders.getOrder(_id);

    const amount =
      (cashAmount || 0) +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

    checkOrderStatus(order);
    checkOrderAmount(order, amount);
    await checkScoreAviableSubtractScoreCampaign(
      subdomain,
      models,
      order,
      paidAmounts,
    );
    await checkCouponCode({ subdomain, order });

    const modifier: any = {
      $set: {
        cashAmount: cashAmount
          ? (order.cashAmount || 0) + Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(paidAmounts || []),
        saleStatus: ORDER_SALE_STATUS.CONFIRMED,
      },
    };

    await models.Orders.updateOne({ _id: order._id }, modifier);

    const newOrder = await models.Orders.getOrder(order._id);

    if (newOrder?.isPre) {
      const items = await models.OrderItems.find({ orderId: newOrder._id });
      if (config.isOnline) {
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
            posToken: config.token,
            action: 'makePayment',
            order,
            items,
          },
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }
    }

    return newOrder;
  },

  async ordersCancel(
    _root,
    { _id },
    { models, posUser, config, subdomain }: IContext,
  ) {
    assertPosUser(posUser);

    return cancelPosOrder(models, _id, subdomain, config.token, posUser._id);
  },

  async cpOrdersCancel(_root, { _id }, { models, subdomain, user }: IContext) {
    return cancelPosOrder(models, _id, subdomain, undefined, user?._id);
  },

  /**
   * Захиалгын cashAmount, mobileAmount талбарууд тусдаа mutation-р
   * утга авах учир энд эдгээр мөнгөн дүн талбар хүлээж авахгүйгээр хадгалагдсан дүнг
   * шалган тооцоо хаана.
   */
  async ordersSettlePayment(
    _root,
    { _id, billType, registerNumber }: ISettlePaymentParams,
    { config, models, subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const order = await models.Orders.getOrder(_id);

    if (!ORDER_TYPES.SALES.includes(order.type || '')) {
      throw new Error(
        'Зөвхөн борлуулах төрөлтэй захиалгын төлбөрийг төлөх боломжтой',
      );
    }

    return await prepareSettlePayment(
      subdomain,
      models,
      order,
      config,
      {
        _id,
        billType,
        registerNumber,
      },
      posUser,
    );
  }, // end ordersSettlePayment()

  async cpOrdersSettlePayment(
    _root,
    { _id, billType, registerNumber }: ISettlePaymentParams,
    { config, models, subdomain, posUser }: IContext,
  ) {
    const order = await models.Orders.getOrder(_id);

    if (!ORDER_TYPES.SALES.includes(order.type || '')) {
      throw new Error(
        'Зөвхөн борлуулах төрөлтэй захиалгын төлбөрийг төлөх боломжтой',
      );
    }

    return await prepareSettlePayment(
      subdomain,
      models,
      order,
      config,
      {
        _id,
        billType,
        registerNumber,
      },
      posUser,
    );
  }, // end ordersSettlePayment()

  async ordersConvertToDeal(
    _root,
    params,
    { models, subdomain, posUser, config }: IContext,
  ) {
    assertPosUser(posUser);

    const order = await models.Orders.getOrder(params._id);
    if (!order.branchId) {
      throw new Error(`First choose orders branch`);
    }

    if (!config.cardsConfig || config.cardsConfig.length) {
      throw new Error(`No matching cards settings found`);
    }

    const cardConfig = config.cardsConfig[order.branchId];
    if (!cardConfig) {
      throw new Error(`No matching cards settings found in orders branch`);
    }

    if (order.convertDealId) {
      const deal = await sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        module: 'deal',
        action: 'findOne',
        input: { _id: order.convertDealId },
        defaultValue: null,
      });
      if (deal) {
        const dealLink = await sendTRPCMessage({
          subdomain,

          pluginName: 'sales',
          module: 'deal',
          action: 'getLink',
          input: { _id: order.convertDealId, type: 'deal' },
          defaultValue: null,
        });

        throw new Error(`Already converted: ${dealLink || ''}`);
      }
    }

    const items = await models.OrderItems.find({ orderId: order._id });

    const dealData: any = {
      name: `Converted from pos: ${order.number}`,
      startDate: order.createdAt,
      closeDate: order.dueDate,
      stageId: cardConfig.stageId,
      assignedUserIds: posUser ? [posUser._id] : undefined,
      watchedUserIds: posUser ? [posUser._id] : undefined,
      productsData: items.map((i) => {
        const discountAmount = i.discountAmount || 0;
        const unitPrice =
          i.discountInfos?.length && i.count
            ? (i.unitPrice || 0) + discountAmount / i.count
            : i.unitPrice;

        return {
          productId: i.productId,
          uom: 'PC',
          currency: 'MNT',
          quantity: i.count,
          unitPrice,
          discount: discountAmount,
          discountPercent: i.discountPercent,
          discountInfos: i.discountInfos,
          amount: i.count * (unitPrice || 0) - discountAmount,
          tickUsed: true,
        };
      }),
    };

    if (order.deliveryInfo && cardConfig.deliveryMapField) {
      const { description, marker } = order.deliveryInfo;
      const fieldId = cardConfig.deliveryMapField.replace(
        'propertiesData.',
        '',
      );

      dealData.description = description;
      dealData.propertiesData = {
        [fieldId]: {
          lat: marker.latitude || marker.lat,
          lng: marker.longitude || marker.lng,
          description: 'location',
        },
      };
    }
    const deal = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'deal',
      action: 'create',
      input: dealData,
      defaultValue: null,
    });
    if (order.customerId) {
      if (
        order.customerId &&
        deal._id &&
        ['customer', 'company'].includes(order.customerType || 'customer')
      ) {
        // conformity to relation
        await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'core',
          module: 'relation',
          action: 'createRelation',
          input: {
            relation: {
              entities: [
                {
                  contentType: 'sales:deal',
                  contentId: deal._id,
                },
                {
                  contentType: `core:${order.customerType || 'customer'}`,
                  contentId: order.customerId,
                },
              ],
            },
          },
          defaultValue: null,
        });
      }
    }

    await models.Orders.updateOne(
      { _id: order._id },
      { $set: { convertDealId: deal._id } },
    );
    return models.Orders.getOrder(order._id);
  },

  async afterFormSubmit(
    _root,
    { _id, conversationId }: { _id: string; conversationId: string },
    { models, subdomain, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const order = await models.Orders.getOrder(_id);

    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'frontline',
      module: 'inbox',
      action: 'createOnlyMessage',
      input: {
        conversationId,
        internal: true,
        customerId:
          (order.customerType || 'customer') === 'customer'
            ? order.customerId
            : '',
        userId: config.adminIds?.[0] || config.cashierIds?.[0] || '',
        content: `
          Pos order:
            paid link:
            <a href="/pos-orders?posId=${config.posId}&search=${order.number}">
              ${order.number}
            </a> <br />
            posclient link:
            <a href="${config.pdomain ?? '/'}?orderId=${order._id}">
              ${order.number}
            </a> <br />
        `,
      },
    });
  },

  async ordersFinish(
    _root,
    doc: IOrderInput & { _id?: string },
    { config, models, subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    if (!ORDER_TYPES.OUT.includes(doc.type || '')) {
      throw new Error(
        'Зөвхөн зарлагадах төрөлтэй захиалгыг л шууд хаах боломжтой',
      );
    }

    let _id = doc._id || '';

    if (!_id) {
      delete doc._id;
    }

    if (doc._id) {
      await ordersEdit(doc as IOrderEditParams, {
        posUser,
        config,
        models,
        subdomain,
      });
    } else {
      const addedOrder = await ordersAdd(doc, {
        posUser,
        config,
        models,
        subdomain,
      });
      _id = addedOrder._id;
    }

    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    const items = await models.OrderItems.find({
      orderId: order._id,
    }).lean();

    validateOrderPayment(order, { billType: BILL_TYPES.INNER });
    const now = new Date();

    try {
      await models.Orders.updateOne(
        { _id },
        {
          $set: {
            paidDate: now,
            modifiedAt: now,
            billType: BILL_TYPES.INNER,
            status: getStatus(
              config,
              'finish',
              { ...order, paidDate: now },
              { ...order },
            ),
          },
        },
      );

      order = await models.Orders.getOrder(_id);

      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          ...order,
          _id,
          status: order.status,
          customerId: order.customerId,
        },
      });

      try {
        await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            posToken: config.token,
            action: 'makePayment',
            order,
            items,
          },
          defaultValue: {},
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }

      return order;
    } catch (e) {
      debugError(e);

      return e;
    }
  },

  async ordersReturn(
    _root,
    {
      _id,
      cashAmount,
      paidAmounts,
      description,
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
      description?: string;
    },
    { subdomain, models, posUser, config }: IContext,
  ) {
    assertPosUser(posUser);

    if (!posUser?._id || !config.adminIds.includes(posUser._id)) {
      throw new Error('Order return admin required');
    }

    const trimmedDescription = description?.trim();

    let order = await models.Orders.getOrder(_id);

    if (order.posToken !== config.token && order.subToken !== config.token) {
      throw new Error('Order does not belong to this POS');
    }
    if (order.status === ORDER_STATUSES.RETURN || order.returnInfo?.returnAt) {
      throw new Error('Order is already returned');
    }

    const amount =
      (cashAmount || 0) +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

    if (order.isPre) {
      if (
        !(order.cashAmount || order.mobileAmount || order.paidAmounts?.length)
      ) {
        throw new Error('Order yet not paid');
      }

      const savedPaidAmount =
        (order.cashAmount || 0) +
        (order.mobileAmount || 0) +
        (order.paidAmounts || []).reduce(
          (sum, i) => Number(sum) + Number(i.amount),
          0,
        );

      if (savedPaidAmount !== amount) {
        throw new Error('Amount exceeds total amount');
      }
    } else {
      if (!order.paidDate) {
        throw new Error('Order yet not paid');
      }

      if (order.totalAmount != amount) {
        throw new Error('Amount exceeds total amount');
      }
    }

    const before = await getOrderChangeSnapshot(models, _id);
    const modifier = {
      $set: {
        status: ORDER_STATUSES.RETURN,
        synced: false,
        returnInfo: {
          cashAmount,
          paidAmounts,
          returnAt: new Date(),
          returnBy: posUser._id,
          description: trimmedDescription || undefined,
        },
        cashAmount: cashAmount
          ? (order.cashAmount || 0) - Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(
          (paidAmounts || []).map((a) => ({ ...a, amount: -1 * a.amount })),
        ),
      },
    };

    const receiptQuery = { contentId: _id, contentType: 'pos' };
    if (
      await models.PutResponses.exists({
        ...receiptQuery,
        $or: [{ status: { $exists: false } }, { status: null }, { status: '' }],
      })
    ) {
      throw new Error(
        'eBarimt request is unresolved. Check its result before returning',
      );
    }
    const hasReceipt = await models.PutResponses.exists({
      ...receiptQuery,
      status: 'SUCCESS',
    });
    if (hasReceipt && !config.ebarimtConfig) {
      throw new Error('Please check ebarimt config');
    }
    const returnResponses =
      hasReceipt && config.ebarimtConfig
        ? await models.PutResponses.returnBill(
            { ...receiptQuery, number: order.number ?? '' },
            config.ebarimtConfig,
            posUser,
          )
        : [];
    if (!Array.isArray(returnResponses)) {
      throw new Error(returnResponses.error);
    }

    await models.Orders.updateOne({ _id: order._id }, modifier);

    await saveOrderChangeSnapshot(
      models,
      _id,
      config.token,
      posUser._id,
      before,
    );

    order = await models.Orders.getOrder(_id);

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id: order._id,
        status: order.status,
        customerId: order.customerId,
        customerType: order.customerType,
      },
    });

    try {
      await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'sales',
        module: 'pos',
        action: 'createOrUpdateOrders',
        input: {
          posToken: config.token,
          action: 'makePayment',
          responses: returnResponses,
          order,
          items: await models.OrderItems.find({ orderId: _id }).lean(),
        },
        defaultValue: {},
      });
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }

    return models.Orders.findOne({ _id: order._id });
  },
};

markResolvers(orderMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});

orderMutations.cpOrdersAdd.wrapperConfig = {
  forClientPortal: true,
};

orderMutations.cpOrdersEdit.wrapperConfig = {
  forClientPortal: true,
};

orderMutations.cpOrderChangeSaleStatus.wrapperConfig = {
  forClientPortal: true,
};

orderMutations.cpOrdersCancel.wrapperConfig = {
  forClientPortal: true,
};

orderMutations.cpOrdersAddPayment.wrapperConfig = {
  forClientPortal: true,
};
orderMutations.cpOrdersSettlePayment.wrapperConfig = {
  forClientPortal: true,
};

export default orderMutations;
