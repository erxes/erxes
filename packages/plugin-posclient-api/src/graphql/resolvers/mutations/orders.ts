import * as Random from 'meteor-random';
import {
  BILL_TYPES,
  ORDER_ITEM_STATUSES,
  ORDER_STATUSES
} from '../../../models/definitions/constants';
import { checkLoyalties } from '../../utils/loyalties';
import { checkPricing } from '../../utils/pricing';
import {
  checkOrderAmount,
  checkOrderStatus,
  checkUnpaidInvoices,
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
import { debugError } from '@erxes/api-utils/src/debuggers';
import { graphqlPubsub } from '../../../configs';
import { IConfig } from '../../../models/definitions/configs';
import { IContext } from '../../types';
import { IOrderInput } from '../../types';
import { sendPosMessage } from '../../../messageBroker';

interface IPaymentBase {
  billType: string;
  registerNumber?: string;
}

interface ISettlePaymentParams extends IPaymentBase {
  _id: string;
}

export interface IPayment extends IPaymentBase {
  cashAmount?: number;
  receivableAmount?: number;
  mobileAmount?: number;
  cardAmount?: number;
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

const getTaxInfo = (config: IConfig) => {
  return {
    hasVat: (config.ebarimtConfig && config.ebarimtConfig.hasVat) || false,
    hasCitytax:
      (config.ebarimtConfig && config.ebarimtConfig?.hasCitytax) || false
  };
};

const orderMutations = {
  async ordersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models, subdomain }: IContext
  ) {
    const { totalAmount, type, customerId, branchId } = doc;

    await validateOrder(models, doc);
    const number = await generateOrderNumber(models, config);

    const orderDoc = {
      number,
      totalAmount,
      type,
      branchId,
      customerId,
      userId: posUser ? posUser._id : ''
    };

    try {
      let preparedDoc = await prepareOrderDoc(doc, config, models);
      preparedDoc = await checkLoyalties(subdomain, preparedDoc);
      preparedDoc = await checkPricing(subdomain, preparedDoc, config);

      const order = await models.Orders.createOrder({
        ...doc,
        ...orderDoc,
        totalAmount: getTotalAmount(preparedDoc.items),
        posToken: config.token,
        departmentId: config.departmentId,
        taxInfo: getTaxInfo(config)
      });

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
          status: ORDER_ITEM_STATUSES.NEW
        });
      }

      await graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          ...order,
          _id: order._id,
          status: order.status,
          customerId: order.customerId
        }
      });

      return order;
    } catch (e) {
      debugError(
        `Error occurred when creating order: ${JSON.stringify(orderDoc)}`
      );

      return e;
    }
  },

  async ordersEdit(
    _root,
    doc: IOrderEditParams,
    { posUser, config, models, subdomain }: IContext
  ) {
    const order = await models.Orders.getOrder(doc._id);

    checkOrderStatus(order);

    await validateOrder(models, doc);

    await cleanOrderItems(doc._id, doc.items, models);

    let preparedDoc = await prepareOrderDoc(doc, config, models);
    preparedDoc = await checkLoyalties(subdomain, preparedDoc);
    preparedDoc = await checkPricing(subdomain, preparedDoc, config);

    preparedDoc.items = await reverseItemStatus(models, preparedDoc.items);

    await updateOrderItems(doc._id, preparedDoc.items, models);

    let status = order.status;

    if (
      [ORDER_STATUSES.COMPLETE, ORDER_STATUSES.DONE].includes(
        order.status || ''
      )
    ) {
      const newItems =
        doc.items.filter(i => i.status === ORDER_ITEM_STATUSES.NEW) || [];
      if (newItems.length) {
        status = ORDER_STATUSES.REDOING;
      }
    }

    const updatedOrder = await models.Orders.updateOrder(doc._id, {
      deliveryInfo: doc.deliveryInfo,
      branchId: doc.branchId,
      customerId: doc.customerId,
      userId: posUser ? posUser._id : '',
      type: doc.type,
      totalAmount: getTotalAmount(preparedDoc.items),
      billType: doc.billType || BILL_TYPES.CITIZEN,
      registerNumber: doc.registerNumber || '',
      slotCode: doc.slotCode,
      posToken: config.token,
      departmentId: config.departmentId,
      taxInfo: getTaxInfo(config),
      status
    });

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        ...updatedOrder,
        _id: updatedOrder._id,
        status: updatedOrder.status,
        customerId: updatedOrder.customerId
      }
    });

    return updatedOrder;
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
        customerId: order.customerId
      }
    });

    if (order.type === 'delivery' && order.status === 'done') {
      try {
        sendPosMessage({
          subdomain,
          action: 'createOrUpdateOrders',
          data: { action: 'statusToDone', order, posToken: config.token }
        });
      } catch (e) {}
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

    await checkUnpaidInvoices(_id, models);

    const items = await models.OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, doc);

    const ebarimtConfig: any = config.ebarimtConfig;

    const data = await prepareEbarimtData(
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

    try {
      const response = await models.PutResponses.putData({
        ...data,
        config: ebarimtConfig,
        models
      });

      if (response && response.success === 'true') {
        const now = new Date();

        await models.Orders.updateOne(
          { _id },
          {
            $set: {
              ...doc,
              paidDate: now,
              modifiedAt: now
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
            action: 'makePayment',
            response,
            order,
            items
          }
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }

      return response;
    } catch (e) {
      debugError(e);

      return e;
    }
  }, // end payment mutation

  async ordersAddPayment(
    _root,
    {
      _id,
      cashAmount = 0,
      receivableAmount = 0,
      cardAmount = 0,
      mobileAmount = 0,
      cardInfo
    },
    { models }: IContext
  ) {
    const order = await models.Orders.getOrder(_id);

    const amount = Number(
      (cashAmount + receivableAmount + cardAmount + mobileAmount).toFixed(2)
    );

    checkOrderStatus(order);
    checkOrderAmount(order, amount);

    const modifier: any = {
      $set: {
        cashAmount: cashAmount
          ? (order.cashAmount || 0) + Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        receivableAmount: receivableAmount
          ? (order.receivableAmount || 0) + Number(receivableAmount.toFixed(2))
          : order.receivableAmount || 0,
        mobileAmount: mobileAmount
          ? (order.mobileAmount || 0) + Number(mobileAmount.toFixed(2))
          : order.mobileAmount || 0,
        cardAmount: cardAmount
          ? (order.cardAmount || 0) + Number(cardAmount.toFixed(2))
          : order.cardAmount || 0
      }
    };

    if (cardInfo) {
      modifier.$push = {
        cardPayments: {
          amount: cardAmount + mobileAmount,
          cardInfo,
          _id: Random.id()
        }
      };
    }

    await models.Orders.updateOne({ _id: order._id }, modifier);

    return models.Orders.findOne({ _id: order._id });
  },

  async ordersCancel(_root, { _id }, { models }: IContext) {
    const order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);
    await checkUnpaidInvoices(_id, models);

    const paidInvoices = await models.QPayInvoices.countDocuments({
      senderInvoiceNo: _id,
      status: 'PAID'
    });

    if (paidInvoices > 0) {
      throw new Error('There are paid QPay invoices for this order');
    }

    if ((order.cardPayments || []).length > 0) {
      throw new Error('Card payment exists for this order');
    }

    if (order.synced === true) {
      throw new Error('Order is already synced to erxes');
    }

    await models.OrderItems.deleteMany({ orderId: _id });

    return models.Orders.deleteOne({ _id });
  },

  /**
   * Захиалгын cashAmount, cardAmount, mobileAmount талбарууд тусдаа mutation-р
   * утга авах учир энд эдгээр мөнгөн дүн талбар хүлээж авахгүйгээр хадгалагдсан дүнг
   * шалган тооцоо хаана.
   */
  async ordersSettlePayment(
    _root,
    { _id, billType, registerNumber }: ISettlePaymentParams,
    { config, models, subdomain }: IContext
  ) {
    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    await checkUnpaidInvoices(_id, models);

    const items = await models.OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, { billType });
    const now = new Date();

    const ebarimtConfig: any = config.ebarimtConfig;

    try {
      let response;

      if (billType !== BILL_TYPES.INNER) {
        const data = await prepareEbarimtData(
          models,
          order,
          ebarimtConfig,
          items,
          billType,
          registerNumber
        );

        ebarimtConfig.districtName = getDistrictName(
          (config.ebarimtConfig && config.ebarimtConfig.districtCode) || ''
        );

        response = await models.PutResponses.putData({
          ...data,
          config: ebarimtConfig,
          models
        });
      }

      if (
        billType === BILL_TYPES.INNER ||
        (response && response.success === 'true')
      ) {
        await models.Orders.updateOne(
          { _id },
          {
            $set: {
              billType,
              registerNumber,
              paidDate: now,
              modifiedAt: now
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
            response,
            order,
            items
          }
        });
      } catch (e) {
        debugError(`Error occurred while sending data to erxes: ${e.message}`);
      }

      return response;
    } catch (e) {
      debugError(e);

      return e;
    }
  } // end ordersSettlePayment()
};

export default orderMutations;
