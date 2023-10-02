import { getPureDate } from '@erxes/api-utils/src';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { graphqlPubsub } from '../../../configs';
import { IModels } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendInboxMessage,
  sendPosMessage
} from '../../../messageBroker';
import { IConfig, IConfigDocument } from '../../../models/definitions/configs';
import {
  BILL_TYPES,
  ORDER_ITEM_STATUSES,
  ORDER_STATUSES,
  ORDER_TYPES
} from '../../../models/definitions/constants';
import { IPaidAmount } from '../../../models/definitions/orders';
import { IPosUserDocument } from '../../../models/definitions/posUsers';
import { PutData } from '../../../models/PutData';
import { IContext, IOrderInput } from '../../types';
import {
  checkOrderAmount,
  checkOrderStatus,
  cleanOrderItems,
  generateOrderNumber,
  getDistrictName,
  getTotalAmount,
  prepareEbarimtData,
  prepareOrderDoc,
  reverseItemStatus,
  updateOrderItems,
  validateOrder,
  validateOrderPayment
} from '../../utils/orderUtils';

interface IPaymentBase {
  billType: string;
  registerNumber?: string;
}

interface ISettlePaymentParams extends IPaymentBase {
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
  billType: string;
  registerNumber: string;
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
      (config.ebarimtConfig && config.ebarimtConfig?.hasCitytax) || false
  };
};

const getStatus = (config, buttonType, doc, order?) => {
  if (!(config && config.kitchenScreen && config.kitchenScreen.isActive)) {
    return ORDER_STATUSES.COMPLETE;
  }

  const type = config.kitchenScreen.showType;

  if (order && order.status) {
    if (
      type === 'paid' &&
      order.status === ORDER_STATUSES.PENDING &&
      doc.paidDate &&
      !order.isPre
    ) {
      return ORDER_STATUSES.NEW;
    }

    if (
      [ORDER_STATUSES.COMPLETE, ORDER_STATUSES.DONE].includes(order.status) &&
      doc.items &&
      doc.items.length
    ) {
      const newItems =
        doc.items.filter(i => i.status === ORDER_ITEM_STATUSES.NEW) || [];
      if (newItems.length) {
        return ORDER_STATUSES.REDOING;
      }
    }

    return order.status;
  }

  if (doc.isPre) {
    return ORDER_STATUSES.PENDING;
  }

  if (type === 'click' && buttonType !== 'order') {
    return ORDER_STATUSES.COMPLETE;
  }

  if (type === 'paid' && (!order || !order.paidDate)) {
    return ORDER_STATUSES.PENDING;
  }

  return ORDER_STATUSES.NEW;
};

const orderAdd = async (models, lastDoc, config) => {
  try {
    const number = await generateOrderNumber(models, config);

    const order = await models.Orders.createOrder({
      ...lastDoc,
      number
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

const ordersAdd = async (
  doc: IOrderInput,
  {
    posUser,
    config,
    models,
    subdomain
  }: {
    posUser: IPosUserDocument;
    config: IConfigDocument;
    models: IModels;
    subdomain: string;
  }
) => {
  const { totalAmount, type, customerId, customerType, branchId, isPre } = doc;
  if (!posUser && !doc.customerId) {
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
    isPre
  };

  try {
    let preparedDoc = await prepareOrderDoc(subdomain, doc, config, models);

    const status = getStatus(config, doc.buttonType, doc);

    const lastDoc = {
      ...doc,
      ...orderDoc,
      totalAmount: getTotalAmount(preparedDoc.items),
      branchId: doc.branchId || config.branchId,
      posToken: config.token,
      departmentId: config.departmentId,
      taxInfo: getTaxInfo(config),
      status
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
        attachment: item.attachment
      });
    }

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id: order._id,
        status: order.status,
        customerId: order.customerId,
        customerType: order.customerType
      }
    });

    return order;
  } catch (e) {
    debugError(
      `Error occurred when creating order: ${JSON.stringify(orderDoc)}`
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
    subdomain
  }: {
    posUser: IPosUserDocument;
    config: IConfigDocument;
    models: IModels;
    subdomain: string;
  }
) => {
  const order = await models.Orders.getOrder(doc._id);

  checkOrderStatus(order);

  if (
    order.isPre &&
    (order.cashAmount || order.mobileAmount || (order.paidAmounts || []).length)
  ) {
    throw new Error('Confirmed and isPre orders cannot be edited');
  }

  await validateOrder(subdomain, models, config, doc);

  await cleanOrderItems(doc._id, doc.items, models);

  let preparedDoc = await prepareOrderDoc(subdomain, doc, config, models);

  preparedDoc.items = await reverseItemStatus(models, preparedDoc.items);

  await updateOrderItems(doc._id, preparedDoc.items, models);

  let status = getStatus(config, doc.buttonType, doc, order);

  // dont change isPre
  const updatedOrder = await models.Orders.updateOrder(doc._id, {
    deliveryInfo: doc.deliveryInfo,
    branchId: config.isOnline ? doc.branchId : config.branchId,
    customerId: doc.customerId,
    customerType: doc.customerType,
    userId: posUser ? posUser._id : '',
    type: doc.type,
    totalAmount: getTotalAmount(preparedDoc.items),
    billType: doc.billType || BILL_TYPES.CITIZEN,
    registerNumber: doc.registerNumber || '',
    slotCode: doc.slotCode,
    posToken: config.token,
    departmentId: config.departmentId,
    taxInfo: getTaxInfo(config),
    dueDate: doc.dueDate,
    description: doc.description,
    status
  });

  await graphqlPubsub.publish('ordersOrdered', {
    ordersOrdered: {
      ...updatedOrder,
      _id: updatedOrder._id,
      status: updatedOrder.status,
      customerId: updatedOrder.customerId,
      customerType: order.customerType
    }
  });

  return updatedOrder;
};

const orderMutations = {
  async ordersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models, subdomain }: IContext
  ) {
    return ordersAdd(doc, { posUser, config, models, subdomain });
  },

  async ordersEdit(
    _root,
    doc: IOrderEditParams,
    { posUser, config, models, subdomain }: IContext
  ) {
    return ordersEdit(doc, { posUser, config, models, subdomain });
  },

  async orderChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, subdomain, config }: IContext
  ) {
    const oldOrder = await models.Orders.getOrder(_id);

    const order = await models.Orders.updateOrder(_id, {
      ...oldOrder,
      status,
      modifiedAt: new Date()
    });

    if (status === ORDER_STATUSES.REDOING) {
      await models.OrderItems.updateMany(
        { orderId: order._id },
        { $set: { status: ORDER_ITEM_STATUSES.CONFIRM } }
      );
    }

    if (status === ORDER_STATUSES.DONE) {
      await models.OrderItems.updateMany(
        { orderId: order._id },
        { $set: { status: ORDER_ITEM_STATUSES.DONE } }
      );
    }

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...order,
        _id,
        status: order.status,
        customerId: order.customerId,
        customerType: order.customerType
      }
    });

    if (
      order.type === 'delivery' &&
      order.status === 'done' &&
      order.deliveryInfo &&
      order.customerId
    ) {
      try {
        sendPosMessage({
          subdomain,
          action: 'createOrUpdateOrders',
          data: { action: 'statusToDone', order, posToken: config.token }
        });
      } catch (e) {}
    }
    return await models.Orders.getOrder(_id);
  },

  async ordersChange(
    _root,
    params: IOrderChangeParams,
    { models, config, subdomain }: IContext
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

    if (params.branchId) doc.branchId = params.branchId;

    if (params.deliveryInfo) doc.deliveryInfo = params.deliveryInfo;
    if (params.description) doc.description = params.description;

    const changedOrder = await models.Orders.updateOrder(params._id, doc);

    if (changedOrder.paidDate || changedOrder.isPre) {
      try {
        sendPosMessage({
          subdomain,
          action: 'createOrUpdateOrders',
          data: {
            posToken: config.token,
            action: 'makePayment',
            order,
            items: await models.OrderItems.find({
              orderId: params._id
            }).lean()
          }
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }
    }
  },

  async orderItemChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models }: IContext
  ) {
    const oldOrderItem = await models.OrderItems.getOrderItem(_id);

    await models.OrderItems.updateOrderItem(_id, { ...oldOrderItem, status });

    await graphqlPubsub.publish('orderItemsOrdered', {
      orderItemsOrdered: {
        _id,
        status: status
      }
    });

    return await models.OrderItems.getOrderItem(_id);
  },
  /**
   * Веб болон мобайл дээр хэрэглээгүй бол устгана.
   */
  async ordersMakePayment(
    _root,
    { _id, doc }: IPaymentParams,
    { config, models, subdomain }: IContext
  ) {
    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    const items = await models.OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, doc);
    const now = new Date();

    const ebarimtConfig: any = config.ebarimtConfig;

    try {
      const ebarimtResponses: any[] = [];

      const ebarimtDatas = await prepareEbarimtData(
        models,
        order,
        ebarimtConfig,
        items,
        doc.billType,
        doc.registerNumber || order.registerNumber
      );

      ebarimtConfig.districtName = getDistrictName(
        (config.ebarimtConfig && config.ebarimtConfig.districtCode) || ''
      );

      for (const data of ebarimtDatas) {
        let response;

        response = await models.PutResponses.putData({
          ...data,
          config: ebarimtConfig,
          models
        });
        ebarimtResponses.push(response);
      }

      if (
        ebarimtResponses.length &&
        !ebarimtResponses.filter(er => er.success !== 'true').length
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
                { ...order }
              )
            }
          }
        );
      }

      order = await models.Orders.getOrder(_id);

      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          ...order,
          _id,
          status: order.status,
          customerId: order.customerId
        }
      });

      try {
        sendPosMessage({
          subdomain,
          action: 'createOrUpdateOrders',
          data: {
            posToken: config.token,
            action: 'makePayment',
            responses: ebarimtResponses,
            order,
            items
          }
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
      paidAmounts
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
    },
    { models, config, subdomain }: IContext
  ) {
    const order = await models.Orders.getOrder(_id);

    const amount =
      (cashAmount || 0) +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

    checkOrderStatus(order);
    checkOrderAmount(order, amount);

    const modifier: any = {
      $set: {
        cashAmount: cashAmount
          ? (order.cashAmount || 0) + Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(paidAmounts || [])
      }
    };

    await models.Orders.updateOne({ _id: order._id }, modifier);

    const newOrder = await models.Orders.getOrder(order._id);

    if (newOrder?.isPre) {
      const items = await models.OrderItems.find({ orderId: newOrder._id });
      if (config.isOnline) {
        const products = await models.Products.find({
          _id: { $in: items.map(i => i.productId) }
        }).lean();
        for (const item of items) {
          const product = products.find(p => p._id === item.productId) || {};
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
            order,
            items
          }
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
      (order.paidAmounts || []).filter(pa => Object.keys(pa.info).length)
        .length > 0
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
    { config, models, subdomain }: IContext
  ) {
    let order = await models.Orders.getOrder(_id);

    if (!ORDER_TYPES.SALES.includes(order.type || '')) {
      throw new Error(
        'Зөвхөн борлуулах төрөлтэй захиалгын төлбөрийг төлөх боломжтой'
      );
    }

    checkOrderStatus(order);

    const items = await models.OrderItems.find({
      orderId: order._id
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
          config.paymentTypes
        );

        ebarimtConfig.districtName = getDistrictName(
          (ebarimtConfig && ebarimtConfig.districtCode) || ''
        );

        for (const data of ebarimtDatas) {
          let response;

          if (data.inner) {
            const putData = new PutData({
              ...config,
              ...data,
              config,
              models
            });

            response = {
              _id: Math.random(),
              billId: 'Түр баримт',
              ...(await putData.generateTransactionInfo()),
              registerNo: ebarimtConfig.companyRD || '',
              success: 'true'
            };
            ebarimtResponses.push(response);

            await models.OrderItems.updateOne(
              { _id: { $in: data.itemIds } },
              { $set: { isInner: true } }
            );

            continue;
          }

          response = await models.PutResponses.putData({
            ...data,
            config: ebarimtConfig,
            models
          });
          ebarimtResponses.push(response);
        }
      }

      if (
        billType === BILL_TYPES.INNER ||
        (ebarimtResponses.length &&
          !ebarimtResponses.filter(er => er.success !== 'true').length)
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
                { ...order }
              )
            }
          }
        );
      }

      order = await models.Orders.getOrder(_id);

      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          ...order,
          _id,
          status: order.status,
          customerId: order.customerId
        }
      });

      if (config.isOnline) {
        const products = await models.Products.find({
          _id: { $in: items.map(i => i.productId) }
        }).lean();
        for (const item of items) {
          const product = products.find(p => p._id === item.productId) || {};
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
            items
          }
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }

      return ebarimtResponses;
    } catch (e) {
      debugError(e);

      return e;
    }
  }, // end ordersSettlePayment()

  async ordersConvertToDeal(
    _root,
    params,
    { models, subdomain, posUser, config }: IContext
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
      const deal = await sendCardsMessage({
        subdomain,
        action: 'deals.findOne',
        data: { _id: order.convertDealId },
        isRPC: true
      });
      if (deal) {
        const dealLink = await sendCardsMessage({
          subdomain,
          action: 'getLink',
          data: { _id: order.convertDealId, type: 'deal' },
          isRPC: true
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
      assignedUserIds: [posUser._id],
      watchedUserIds: [posUser._id],
      productsData: items.map(i => ({
        productId: i.productId,
        uom: 'PC',
        currency: 'MNT',
        quantity: i.count,
        unitPrice: i.unitPrice,
        amount: i.count * (i.unitPrice || 0),
        tickUsed: true
      }))
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
              marker.latitude || marker.lat
            ]
          },
          value: {
            lat: marker.latitude || marker.lat,
            lng: marker.longitude || marker.lng,
            description: 'location'
          },
          stringValue: `${marker.longitude || marker.lng},${marker.latitude ||
            marker.lat}`
        }
      ];
    }

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.create',
      data: dealData,
      isRPC: true,
      defaultValue: {}
    });

    if (order.customerId) {
      if (
        order.customerId &&
        deal._id &&
        ['customer', 'company'].includes(order.customerType || 'customer')
      ) {
        await sendCoreMessage({
          subdomain,
          action: 'conformities.addConformity',
          data: {
            mainType: 'deal',
            mainTypeId: deal._id,
            relType: order.customerType || 'customer',
            relTypeId: order.customerId
          },
          isRPC: true
        });
      }
    }

    await models.Orders.updateOne(
      { _id: order._id },
      { $set: { convertDealId: deal._id } }
    );
    return models.Orders.getOrder(order._id);
  },

  async afterFormSubmit(
    _root,
    { _id, conversationId }: { _id: string; conversationId: string },
    { models, subdomain, config }: IContext
  ) {
    const order = await models.Orders.getOrder(_id);

    await sendInboxMessage({
      subdomain,
      action: 'createOnlyMessage',
      data: {
        conversationId,
        internal: true,
        customerId:
          order.customerType || 'customer' === 'customer'
            ? order.customerId
            : '',
        userId:
          (config.adminIds && config.adminIds.length && config.adminIds[0]) ||
          (config.cashierIds && config.cashierIds[0]) ||
          '',
        content: `
          Pos order:
            paid link: <a href="/pos-orders?posId=${config.posId}&search=${
          order.number
        }">${order.number}</a> <br />
            posclient link: <a href="${config.pdomain || '/'}?orderId=${
          order._id
        }">${order.number}</a> <br />
        `
      },
      isRPC: true
    });
  },

  async ordersFinish(
    _root,
    doc: IOrderInput & { _id?: string },
    { config, models, subdomain, posUser }: IContext
  ) {
    if (!ORDER_TYPES.OUT.includes(doc.type || '')) {
      throw new Error(
        'Зөвхөн зарлагадах төрөлтэй захиалгыг л шууд хаах боломжтой'
      );
    }

    let _id = doc._id || '';
    if (doc._id) {
      await ordersEdit(doc as IOrderEditParams, {
        posUser,
        config,
        models,
        subdomain
      });
    } else {
      const addedOrder = await ordersAdd(doc, {
        posUser,
        config,
        models,
        subdomain
      });
      _id = addedOrder._id;
    }

    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    const items = await models.OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, { billType: BILL_TYPES.INNER });
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
              { ...order }
            )
          }
        }
      );

      order = await models.Orders.getOrder(_id);

      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          ...order,
          _id,
          status: order.status,
          customerId: order.customerId
        }
      });

      try {
        sendPosMessage({
          subdomain,
          action: 'createOrUpdateOrders',
          data: {
            posToken: config.token,
            action: 'makePayment',
            order,
            items
          }
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
      paidAmounts
    }: {
      _id: string;
      cashAmount?: number;
      paidAmounts?: IPaidAmount[];
    },
    { subdomain, models, posUser, config }: IContext
  ) {
    if (!config.adminIds.includes(posUser._id)) {
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
          0
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
          returnBy: posUser._id
        },
        cashAmount: cashAmount
          ? (order.cashAmount || 0) - Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        paidAmounts: (order.paidAmounts || []).concat(
          (paidAmounts || []).map(a => ({ ...a, amount: -1 * a.amount }))
        )
      }
    };

    const ebarimtConfig = config.ebarimtConfig;

    if (!ebarimtConfig) {
      throw new Error('Please check ebarimt config');
    }

    let returnResponses = (await models.PutResponses.returnBill({
      contentId: _id,
      contentType: 'pos',
      number: order.number || '',
      config: ebarimtConfig
    })) as any;

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
        customerType: order.customerType
      }
    });

    try {
      sendPosMessage({
        subdomain,
        action: 'createOrUpdateOrders',
        data: {
          posToken: config.token,
          action: 'makePayment',
          responses: returnResponses,
          order,
          items: await models.OrderItems.find({ orderId: _id }).lean()
        }
      });
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }

    return models.Orders.findOne({ _id: order._id });
  }
};

export default orderMutations;
