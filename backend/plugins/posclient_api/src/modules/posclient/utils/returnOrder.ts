import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '../@types/types';
import { IOrderDocument, IPaidAmount } from '../@types/orders';
import { ORDER_STATUSES } from '../db/definitions/constants';
import { debugError } from '../debugError';
import { assertPosUser } from './assertPosUser';
import {
  getOrderChangeSnapshot,
  saveOrderChangeSnapshot,
} from './orderChangeLogs';
import { returnOrderReceipts } from './orderReceipts';

export interface IReturnOrderInput {
  _id: string;
  cashAmount?: number;
  paidAmounts?: IPaidAmount[];
  description?: string;
}

export const returnPosOrder = async (
  { _id, cashAmount, paidAmounts, description }: IReturnOrderInput,
  {
    subdomain,
    models,
    posUser,
    config,
  }: Pick<IContext, 'subdomain' | 'models' | 'posUser' | 'config'>,
): Promise<IOrderDocument | null> => {
  assertPosUser(posUser);
  if (!posUser._id || !config.adminIds.includes(posUser._id)) {
    throw new Error('Order return admin required');
  }

  const originalOrder = await models.Orders.getOrder(_id);
  if (
    originalOrder.posToken !== config.token &&
    originalOrder.subToken !== config.token
  ) {
    throw new Error('Order does not belong to this POS');
  }
  if (
    originalOrder.status === ORDER_STATUSES.RETURN ||
    originalOrder.returnInfo?.returnAt
  ) {
    throw new Error('Order is already returned');
  }

  const amount =
    (cashAmount || 0) +
    (paidAmounts || []).reduce(
      (sum, payment) => Number(sum) + Number(payment.amount),
      0,
    );
  if (originalOrder.isPre) {
    if (
      !(
        originalOrder.cashAmount ||
        originalOrder.mobileAmount ||
        originalOrder.paidAmounts?.length
      )
    ) {
      throw new Error('Order yet not paid');
    }
    const savedPaidAmount =
      (originalOrder.cashAmount || 0) +
      (originalOrder.mobileAmount || 0) +
      (originalOrder.paidAmounts || []).reduce(
        (sum, payment) => Number(sum) + Number(payment.amount),
        0,
      );
    if (savedPaidAmount !== amount) {
      throw new Error('Amount exceeds total amount');
    }
  } else {
    if (!originalOrder.paidDate) {
      throw new Error('Order yet not paid');
    }
    if (originalOrder.totalAmount != amount) {
      throw new Error('Amount exceeds total amount');
    }
  }

  const before = await getOrderChangeSnapshot(models, _id, originalOrder);
  const modifier = {
    $set: {
      status: ORDER_STATUSES.RETURN,
      synced: false,
      returnInfo: {
        cashAmount,
        paidAmounts,
        returnAt: new Date(),
        returnBy: posUser._id,
        description: description?.trim() || undefined,
      },
      cashAmount: cashAmount
        ? (originalOrder.cashAmount || 0) - Number(cashAmount.toFixed(2))
        : originalOrder.cashAmount || 0,
      paidAmounts: (originalOrder.paidAmounts || []).concat(
        (paidAmounts || []).map((payment) => ({
          ...payment,
          amount: -1 * payment.amount,
        })),
      ),
    },
  };

  const responses = await returnOrderReceipts(
    models,
    originalOrder,
    config,
    posUser,
  );
  await models.Orders.updateOne({ _id: originalOrder._id }, modifier);
  await saveOrderChangeSnapshot(
    models,
    _id,
    config.token,
    posUser._id,
    before,
    'return',
  );

  const order = await models.Orders.getOrder(_id);
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
        responses,
        order,
        items: await models.OrderItems.find({ orderId: _id }).lean(),
      },
      defaultValue: {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugError(`Error occurred while sending data to erxes: ${message}`);
  }
  return models.Orders.findOne({ _id: order._id });
};
