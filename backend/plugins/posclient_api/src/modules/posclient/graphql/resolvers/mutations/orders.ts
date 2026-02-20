import {
  BILL_TYPES,
  ORDER_ITEM_STATUSES,
  ORDER_SALE_STATUS,
  ORDER_STATUSES,
  ORDER_TYPES,
} from '@/posclient/db/definitions/constants';

import { IDoc } from '@/posclient/db/models/PutData';

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
} from 'erxes-api-shared/utils';
import { IContext, IOrderInput } from '@/posclient/@types/types';
import { IConfig, IConfigDocument } from '~/modules/posclient/@types/configs';
import { IPaidAmount } from '~/modules/posclient/@types/orders';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import { IOrderItemInput } from '~/modules/posclient/@types/types';
import { checkSlotStatus } from '~/modules/posclient/utils/slots';
import { IModels } from '~/connectionResolvers';
import { prepareSettlePayment } from '~/modules/posclient/utils';

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
  deliveryInfo?: string;
  description?: string;
}

const getTaxInfo = (config: IConfig) => {
  return {
    hasVat: (config.ebarimtConfig && config.ebarimtConfig.hasVat) || false,
    hasCitytax:
      (config.ebarimtConfig && config.ebarimtConfig?.hasCitytax) || false,
  };
};

export const getStatus = (config, buttonType, doc, order?) => {
  if (doc.isPre) {
    return ORDER_STATUSES.PENDING;
  }

  if (!(config && config.kitchenScreen && config.kitchenScreen.isActive)) {
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

  if (type === 'paid' && (!order || !order.paidDate)) {
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
  if (!posUser && !doc.customerId && customerType !== 'visitor') {
    throw new Error('order has not owner');
  }

  if (
    posUser &&
    ![...config.adminIds, ...config.cashierIds].includes(posUser._id)
  ) {
    throw new Error('Please logout and reLogin');
  }

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
    let preparedDoc = await prepareOrderDoc(
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

const ordersEdit = async (
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

  await cleanOrderItems(doc._id, doc.items, models);

  let preparedDoc = await prepareOrderDoc(
    subdomain,
    doc,
    config,
    models,
    posUser,
  );

  preparedDoc.items = await reverseItemStatus(models, preparedDoc.items);

  await updateOrderItems(doc._id, preparedDoc.items, models);

  let status = getStatus(config, doc.buttonType, doc, order);
  let saleStatus = getSaleStatus(config, doc, preparedDoc);

  // dont change isPre
  const updatedOrder = await models.Orders.updateOrder(doc._id, {
    deliveryInfo: doc.deliveryInfo,
    branchId: config.branchId || doc.branchId,
    subBranchId: doc.branchId,
    customerId: doc.customerId,
    customerType: doc.customerType,
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
    bonusCount: item.bonusCount,
    bonusVoucherId: item.bonusVoucherId,
    manufacturedDate: item.manufacturedDate,
    description: item.description,
    attachment: item.attachment,
    closeDate: item.closeDate,
  };
};

const orderMutations: Record<string, any> = {
  async ordersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models, subdomain }: IContext,
  ) {
    if (doc.origin === 'qrMenu' && doc.isSingle === false && doc.slotCode) {
      if (doc.deviceId) {
        doc.items = doc.items.map((i) => ({
          ...i,
          byDevice: { [doc.deviceId || '']: i.count },
        }));
      }
      const slotInSameOrder = await models.Orders.findOne({
        $or: [{ posToken: config.token }, { subToken: config.token }],
        paidDate: { $exists: false },
        status: {
          $in: [
            ORDER_STATUSES.NEW,
            ORDER_STATUSES.DOING,
            ORDER_STATUSES.DONE,
            ORDER_STATUSES.COMPLETE,
            ORDER_STATUSES.REDOING,
            ORDER_STATUSES.PENDING,
          ],
        },
        origin: 'qrMenu',
        slotCode: doc.slotCode,
        isSingle: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .lean();

      if (slotInSameOrder?._id) {
        const items: IOrderItemInput[] = (
          await models.OrderItems.find({ orderId: slotInSameOrder._id }).lean()
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
                ((duplicatedItem.byDevice || {})[doc.deviceId || ''] || 0) +
                newItem.count,
            };
          } else {
            items.push({
              ...getItemInput(newItem),
              byDevice: { [doc.deviceId || '']: newItem.count },
            });
          }
        }

        return ordersEdit(
          { ...doc, ...slotInSameOrder, items },
          { posUser, config, models, subdomain },
        );
      }
    }
    return ordersAdd(doc, { posUser, config, models, subdomain });
  },

  async ordersEdit(
    _root,
    doc: IOrderEditParams,
    { posUser, config, models, subdomain }: IContext,
  ) {
    return ordersEdit(doc, { posUser, config, models, subdomain });
  },

  async orderChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, subdomain, config }: IContext,
  ) {
    const oldOrder = await models.Orders.getOrder(_id);

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
        // sendPosMessage({
        //   subdomain,
        //   action: 'createOrUpdateOrders',
        //   data: { action: 'statusToDone', order, posToken: config.token },
        // });
        await sendTRPCMessage({
          subdomain,

          method: 'query',
          pluginName: 'createOrUpdateOrders',
          module: 'pos',
          action: 'covers.confirm',
          input: {
            query: { action: 'statusToDone', order, posToken: config.token },
          },
          defaultValue: {},
        });
      } catch (e) {
        console.error('Error confirming covers:', e);
      }
    }
    return await models.Orders.getOrder(_id);
  },

  async orderChangeSaleStatus(
    _root,
    { _id, saleStatus }: { _id: string; saleStatus: string },
    { models, subdomain, config }: IContext,
  ) {
    const oldOrder = await models.Orders.getOrder(_id);

    await models.Orders.updateOrder(_id, {
      ...oldOrder,
      saleStatus,
      modifiedAt: new Date(),
    });

    return await models.Orders.getOrder(_id);
  },

  async ordersChange(
    _root,
    params: IOrderChangeParams,
    { models, config, subdomain }: IContext,
  ) {
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

    const doc = { ...order };

    if (params.dueDate) doc.dueDate = params.dueDate;

    if (params.branchId) {
      if (config.branchId) {
        doc.subBranchId = params.branchId;
      } else {
        doc.branchId = params.branchId;
        doc.subBranchId = params.branchId;
      }
    }

    if (params.deliveryInfo) doc.deliveryInfo = params.deliveryInfo;
    if (params.description) doc.description = params.description;

    const changedOrder = await models.Orders.updateOrder(params._id, doc);

    if (changedOrder.paidDate || changedOrder.isPre) {
      try {
        // sendPosMessage({
        //   subdomain,
        //   action: 'createOrUpdateOrders',
        //   data: {
        //     posToken: config.token,
        //     action: 'makePayment',
        //     order,
        //     items: await models.OrderItems.find({
        //       orderId: params._id,
        //     }).lean(),
        //   },
        // });

        await sendTRPCMessage({
          subdomain,

          method: 'query',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            query: {
              posToken: config.token,
              action: 'makePayment',
              order,
              items: await models.OrderItems.find({
                orderId: params._id,
              }).lean(),
            },
          },
          defaultValue: {},
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }
    }
  },

  async orderItemChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, config }: IContext,
  ) {
    const oldOrderItem = await models.OrderItems.getOrderItem(_id);

    await models.OrderItems.updateOrderItem(_id, { ...oldOrderItem, status });

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

      let response;

      response = await models.PutResponses.putData(
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
          subdomain,

          method: 'query',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            query: {
              posToken: config.token,
              action: 'makePayment',
              responses: ebarimtResponses,
              order,
              items,
            },
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
        // sendPosMessage({
        //   subdomain,
        //   action: 'createOrUpdateOrders',
        //   data: {
        //     posToken: config.token,
        //     action: 'makePayment',
        //     order,
        //     items,
        //   },
        // });
        await sendTRPCMessage({
          subdomain,

          method: 'query',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            query: {
              posToken: config.token,
              action: 'makePayment',
              order,
              items,
            },
          },
          defaultValue: {},
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }
    }

    return newOrder;
  },

  async ordersCancel(_root, { _id }, { models }: IContext) {
    const order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    if (
      order.mobileAmount ||
      (order.paidAmounts || []).filter(
        (pa) => pa.info && Object.keys(pa.info).length,
      ).length > 0
    ) {
      throw new Error('Card payment exists for this order');
    }

    if (
      order.isPre &&
      (order.cashAmount || order.mobileAmount || order.paidAmounts?.length)
    ) {
      throw new Error('Cannot cancel cause PreOrder added payment');
    }

    if (order.synced === true) {
      throw new Error('Order is already synced to erxes');
    }

    await models.OrderItems.deleteMany({ orderId: _id });

    return models.Orders.deleteOne({ _id });
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
    let order = await models.Orders.getOrder(_id);

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
      // const deal = await sendSalesMessage({
      //   subdomain,
      //   action: 'deals.findOne',
      //   data: { _id: order.convertDealId },
      //   isRPC: true,
      // });
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

        throw new Error(`Already converted: ${dealLink}`);
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
      productsData: items.map((i) => ({
        productId: i.productId,
        uom: 'PC',
        currency: 'MNT',
        quantity: i.count,
        unitPrice: i.unitPrice,
        amount: i.count * (i.unitPrice || 0),
        tickUsed: true,
      })),
    };

    if (order.deliveryInfo && cardConfig.deliveryMapField) {
      const { description, marker } = order.deliveryInfo;
      dealData.description = description;
      dealData.customFieldsData = [
        {
          field: cardConfig.deliveryMapField.replace('customFieldsData.', ''),
          locationValue: {
            type: 'Point',
            coordinates: [
              marker.longitude || marker.lng,
              marker.latitude || marker.lat,
            ],
          },
          value: {
            lat: marker.latitude || marker.lat,
            lng: marker.longitude || marker.lng,
            description: 'location',
          },
          stringValue: `${marker.longitude || marker.lng},${
            marker.latitude || marker.lat
          }`,
        },
      ];
    }

    // const deal = await sendSalesMessage({
    //   subdomain,
    //   action: 'deals.create',
    //   data: dealData,
    //   isRPC: true,
    //   defaultValue: {},
    // });
    const deal = await sendTRPCMessage({
      subdomain,

      pluginName: 'sales',
      module: 'deal',
      action: 'createItem',
      input: dealData,
      defaultValue: null,
    });
    if (order.customerId) {
      if (
        order.customerId &&
        deal._id &&
        ['customer', 'company'].includes(order.customerType || 'customer')
      ) {
        // await sendCoreMessage({
        //   subdomain,
        //   action: 'conformities.addConformity',
        //   data: {
        //     mainType: 'deal',
        //     mainTypeId: deal._id,
        //     relType: order.customerType || 'customer',
        //     relTypeId: order.customerId,
        //   },
        //   isRPC: true,
        // });
        await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          module: 'conformity',
          action: 'addConformity',
          input: {
            mainType: 'deal',
            mainTypeId: deal._id,
            relType: order.customerType || 'customer',
            relTypeId: order.customerId,
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
    { models, subdomain, config }: IContext,
  ) {
    const order = await models.Orders.getOrder(_id);

    // await sendInboxMessage({
    //   subdomain,
    //   action: 'createOnlyMessage',
    //   data: {
    //     conversationId,
    //     internal: true,
    //     customerId:
    //       order.customerType || 'customer' === 'customer'
    //         ? order.customerId
    //         : '',
    //     userId:
    //       (config.adminIds && config.adminIds.length && config.adminIds[0]) ||
    //       (config.cashierIds && config.cashierIds[0]) ||
    //       '',
    //     content: `
    //       Pos order:
    //         paid link:
    //         <a href="/pos-orders?posId=${config.posId}&search=${order.number}">
    //           ${order.number}
    //         </a> <br />
    //         posclient link:
    //         <a href="${config.pdomain ?? '/'}?orderId=${order._id}">
    //           ${order.number}
    //         </a> <br />
    //     `,
    //   },
    //   isRPC: true,
    // });
  },

  async ordersFinish(
    _root,
    doc: IOrderInput & { _id?: string },
    { config, models, subdomain, posUser }: IContext,
  ) {
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
        // sendPosMessage({
        //   subdomain,
        //   action: 'createOrUpdateOrders',
        //   data: {
        //     posToken: config.token,
        //     action: 'makePayment',
        //     order,
        //     items,
        //   },
        // });
        await sendTRPCMessage({
          subdomain,

          method: 'query',
          pluginName: 'sales',
          module: 'pos',
          action: 'createOrUpdateOrders',
          input: {
            query: {
              posToken: config.token,
              action: 'makePayment',
              order,
              items,
            },
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
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
    },
    { subdomain, models, posUser, config }: IContext,
  ) {
    if (!posUser?._id || !config.adminIds.includes(posUser._id)) {
      throw new Error('Order return admin required');
    }

    let order = await models.Orders.getOrder(_id);

    if (order.returnInfo && order.returnInfo.returnAt) {
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

    const modifier: any = {
      $set: {
        status: ORDER_STATUSES.RETURN,
        returnInfo: {
          cashAmount,
          paidAmounts,
          returnAt: new Date(),
          returnBy: posUser._id,
        },
        cashAmount: cashAmount
          ? (order.cashAmount || 0) - Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(
          (paidAmounts || []).map((a) => ({ ...a, amount: -1 * a.amount })),
        ),
      },
    };

    const ebarimtConfig = config.ebarimtConfig;

    if (!ebarimtConfig) {
      throw new Error('Please check ebarimt config');
    }

    let returnResponses = (await models.PutResponses.returnBill(
      {
        contentId: _id,
        contentType: 'pos',
        number: order.number ?? '',
      },
      ebarimtConfig,
      posUser,
    )) as any;

    if (returnResponses.error) {
      returnResponses = [];
    }

    await models.Orders.updateOne({ _id: order._id }, modifier);

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
      // sendPosMessage({
      //   subdomain,
      //   action: 'createOrUpdateOrders',
      //   data: {
      //     posToken: config.token,
      //     action: 'makePayment',
      //     responses: returnResponses,
      //     order,
      //     items: await models.OrderItems.find({ orderId: _id }).lean(),
      //   },
      // });
      await sendTRPCMessage({
        subdomain,

        method: 'query',
        pluginName: 'sales',
        module: 'pos',
        action: 'createOrUpdateOrders',
        input: {
          query: {
            posToken: config.token,
            action: 'makePayment',
            responses: returnResponses,
            order,
            items: await models.OrderItems.find({ orderId: _id }).lean(),
          },
        },
        defaultValue: {},
      });
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }

    return models.Orders.findOne({ _id: order._id });
  },
};
function debugError(arg0: string) {
  throw new Error('Function not implemented.');
}

export default orderMutations;
