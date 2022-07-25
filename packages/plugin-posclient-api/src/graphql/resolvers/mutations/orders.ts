import * as Random from 'meteor-random';
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
  updateOrderItems,
  validateOrder,
  validateOrderPayment
} from '../../utils/orderUtils';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { graphqlPubsub } from '../../../configs';
import { IContext } from '../../types';
import { IOrderInput } from '../../types';
import {
  BILL_TYPES,
  ORDER_STATUSES
} from '../../../models/definitions/constants';
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

const orderMutations = {
  async ordersAdd(
    _root,
    doc: IOrderInput,
    { posUser, config, models }: IContext
  ) {
    const { totalAmount, type, customerId, branchId } = doc;

    await validateOrder(models, doc);

    const orderDoc = {
      number: await generateOrderNumber(models, config),
      totalAmount,
      type,
      branchId,
      customerId,
      userId: posUser ? posUser._id : ''
    };

    try {
      const preparedDoc = await prepareOrderDoc(doc, config, models);

      const order = await models.Orders.createOrder({
        ...doc,
        ...orderDoc,
        totalAmount: preparedDoc.totalAmount
      });

      for (const item of preparedDoc.items) {
        await models.OrderItems.createOrderItem({
          count: item.count,
          productId: item.productId,
          unitPrice: item.unitPrice,
          orderId: order._id,
          isPackage: item.isPackage,
          isTake: item.isTake
        });
      }

      return order;
    } catch (e) {
      debugError(
        `Error occurred when creating order: ${JSON.stringify(orderDoc)}`
      );

      return e;
    }
  },
  async ordersEdit(_root, doc: IOrderEditParams, { config, models }: IContext) {
    const order = await models.Orders.getOrder(doc._id);

    checkOrderStatus(order);

    await validateOrder(models, doc);

    await cleanOrderItems(doc._id, doc.items, models);

    const preparedDoc = await prepareOrderDoc(doc, config, models);

    await updateOrderItems(doc._id, preparedDoc.items, models);

    const updatedOrder = await models.Orders.updateOrder(doc._id, {
      deliveryInfo: doc.deliveryInfo,
      branchId: doc.branchId,
      customerId: doc.customerId,
      type: doc.type,
      totalAmount: getTotalAmount(preparedDoc.items),
      billType: doc.billType || BILL_TYPES.CITIZEN,
      registerNumber: doc.registerNumber || ''
    });

    return updatedOrder;
  },

  async orderChangeStatus(
    _root,
    { _id, status }: { _id: string; status: string },
    { models, subdomain }: IContext
  ) {
    const oldOrder = await models.Orders.getOrder(_id);

    const order = await models.Orders.updateOrder(_id, { ...oldOrder, status });

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
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
          data: { action: 'statusToDone', order }
        });
      } catch (e) {}
    }
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
      config.ebarimtConfig.districtCode
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
              status: ORDER_STATUSES.PAID,
              modifiedAt: now
            }
          }
        );
      }

      order = await models.Orders.getOrder(_id);
      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          _id,
          status: order.status,
          customerId: order.customerId
        }
      });

      try {
        sendPosMessage({
          subdomain,
          action: 'vrpc_queue',
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
    { _id, cashAmount = 0, cardAmount = 0, cardInfo },
    { models }: IContext
  ) {
    const order = await models.Orders.getOrder(_id);

    const amount = Number((cashAmount + cardAmount).toFixed(2));

    checkOrderStatus(order);
    checkOrderAmount(order, amount);

    const modifier: any = {
      $set: {
        cashAmount: cashAmount
          ? (order.cashAmount || 0) + Number(cashAmount.toFixed(2))
          : order.cashAmount || 0,
        cardAmount: cardAmount
          ? (order.cardAmount || 0) + Number(cardAmount.toFixed(2))
          : order.cardAmount || 0
      }
    };

    if (cardAmount) {
      modifier.$push = {
        cardPayments: { amount: cardAmount, cardInfo, _id: Random.id() }
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

    const ebarimtConfig: any = config.ebarimtConfig;

    const data = await prepareEbarimtData(
      models,
      order,
      ebarimtConfig,
      items,
      billType,
      registerNumber
    );

    ebarimtConfig.districtName = getDistrictName(
      config.ebarimtConfig.districtCode
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
              billType,
              registerNumber,
              paidDate: now,
              status: ORDER_STATUSES.PAID,
              modifiedAt: now
            }
          }
        );
      }

      order = await models.Orders.getOrder(_id);

      graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
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
            syncId: (config.syncInfo || {}).id,
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
