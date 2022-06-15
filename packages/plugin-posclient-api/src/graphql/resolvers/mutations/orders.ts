import * as Random from 'meteor-random';

import { Orders } from '../../../models/Orders';
import { OrderItems } from '../../../models/OrderItems';
import { PutResponses } from '../../../models/PutResponses';
import { IOrderInput } from '../../types';
import {
  generateOrderNumber,
  validateOrderPayment,
  validateOrder,
  updateOrderItems,
  getTotalAmount,
  prepareEbarimtData,
  getDistrictName,
  prepareOrderDoc,
  cleanOrderItems,
  checkOrderStatus,
  checkOrderAmount,
  checkUnpaidInvoices
} from '../../utils/orderUtils';
import { IContext } from '../../types';
import messageBroker from '../../messageBroker';
import { ORDER_STATUSES } from '../../../models/definitions/constants';
import { graphqlPubsub } from '../../pubsub';
import { debugError } from '../../../debugger';
import { IOrderDocument } from '../../../models/definitions/orders';
// import { QPayInvoices } from '../../../models/QPayInvoices';

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
}

const orderMutations = {
  async ordersAdd(
    _root,
    models,
    doc: IOrderInput,
    { posUser, config }: IContext
  ) {
    const { totalAmount, type, customerId, branchId } = doc;

    await validateOrder(doc);

    const orderDoc = {
      totalAmount,
      type,
      branchId,
      customerId
    };

    try {
      const preparedDoc = await prepareOrderDoc(doc, config);

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
  async ordersEdit(_root, models, doc: IOrderEditParams, { config }: IContext) {
    const order = await models.Orders.getOrder(doc._id);

    checkOrderStatus(order);

    await validateOrder({ ...doc });

    await cleanOrderItems(doc._id, doc.items);

    const preparedDoc = await prepareOrderDoc({ ...doc }, config);

    await updateOrderItems(doc._id, preparedDoc.items);

    const updatedOrder = await models.Orders.updateOrder(doc._id, {
      deliveryInfo: doc.deliveryInfo,
      branchId: doc.branchId,
      customerId: doc.customerId,
      type: doc.type,
      totalAmount: getTotalAmount(preparedDoc.items)
    });

    return updatedOrder;
  },

  async orderChangeStatus(
    _root,
    models,
    { _id, status }: { _id: string; status: string },
    {}: IContext
  ) {
    await models.Orders.getOrder(_id);

    const order = await models.Orders.updateOrder(_id, { status });

    await graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        _id,
        status: order.status
      }
    });

    if (order.type === 'delivery' && order.status === 'done') {
      try {
        messageBroker().sendMessage('vrpc_queue:erxes-pos-to-api', {
          action: 'statusToDone',

          order
        });
      } catch (e) {}
    }
  },

  /**
   * Веб болон мобайл дээр хэрэглээгүй бол устгана.
   */
  async ordersMakePayment(
    _root,
    models,
    { _id, doc }: IPaymentParams,
    { config }: IContext
  ) {
    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    await checkUnpaidInvoices(_id);

    const items = await OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, doc);

    const data = await prepareEbarimtData(
      order,
      config.ebarimtConfig,
      items,
      doc.billType,
      doc.registerNumber
    );

    const ebarimtConfig = {
      districtName: getDistrictName('')
    };

    try {
      const response = await models.PutResponses.putData({
        ...data,
        config: ebarimtConfig
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
          status: order.status
        }
      });

      try {
        messageBroker().sendMessage('vrpc_queue:erxes-pos-to-api', {
          action: 'makePayment',
          response,
          order,
          items
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
    models,
    { _id, cashAmount = 0, cardAmount = 0, cardInfo }
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
  async ordersCancel(_root, models, { _id }) {
    const order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);
    await checkUnpaidInvoices(_id);

    // const paidInvoices = await QPayInvoices.countDocuments({
    //   senderInvoiceNo: _id,
    //   status: 'PAID',
    // });

    // if (paidInvoices > 0) {
    //   throw new Error('There are paid QPay invoices for this order');
    // }

    if ((order.cardPayments || []).length > 0) {
      throw new Error('Card payment exists for this order');
    }

    if (order.synced === true) {
      throw new Error('Order is already synced to erxes');
    }

    await models.OrderItems.deleteMany({ orderId: _id });

    return Orders.deleteOne({ _id });
  },

  /**
   * Захиалгын cashAmount, cardAmount, mobileAmount талбарууд тусдаа mutation-р
   * утга авах учир энд эдгээр мөнгөн дүн талбар хүлээж авахгүйгээр хадгалагдсан дүнг
   * шалган тооцоо хаана.
   */
  async ordersSettlePayment(
    _root,
    models,
    { _id, billType, registerNumber }: ISettlePaymentParams,
    { config }: IContext
  ) {
    let order = await models.Orders.getOrder(_id);

    checkOrderStatus(order);

    await checkUnpaidInvoices(_id);

    const items = await OrderItems.find({
      orderId: order._id
    }).lean();

    await validateOrderPayment(order, { billType });

    const data = await prepareEbarimtData(
      order,
      config.ebarimtConfig,
      items,
      billType,
      registerNumber
    );

    const ebarimtConfig = {
      districtName: getDistrictName('')
    };

    try {
      const response = await models.PutResponses.putData({
        ...data,
        config: ebarimtConfig
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
          status: order.status
        }
      });

      try {
        messageBroker().sendMessage('vrpc_queue:erxes-pos-to-api', {
          action: 'makePayment',

          response,
          order,
          items
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
