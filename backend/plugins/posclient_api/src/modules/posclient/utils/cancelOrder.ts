import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  getOrderChangeSnapshot,
  saveOrderCancellationSnapshot,
} from './orderChangeLogs';
import {
  assertNoUnresolvedOrderReceipts,
  getOrderReceiptQuery,
  hasSuccessfulOrderReceipt,
} from './orderReceipts';

export const cancelPosOrder = async (
  models: IModels,
  _id: string,
  subdomain: string,
  posToken?: string,
  userId?: string,
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const order = await models.Orders.getOrder(_id);
  const token = posToken || order.posToken;

  if (!token || (order.posToken !== token && order.subToken !== token)) {
    throw new Error('Order does not belong to this POS');
  }
  if (order.status === 'return' || order.returnInfo?.returnAt) {
    throw new Error('Returned orders must be retained');
  }
  if (order.paidDate) {
    throw new Error(
      'Paid orders cannot be cancelled. Return the order instead',
    );
  }

  if (await hasSuccessfulOrderReceipt(models, _id)) {
    throw new Error(
      'Successful eBarimt exists. Return the order instead of cancelling it',
    );
  }
  await assertNoUnresolvedOrderReceipts(models, _id, 'cancelling');
  if (
    order.mobileAmount ||
    (order.paidAmounts || []).some(
      (payment) => payment.info && Object.keys(payment.info).length > 0,
    )
  ) {
    throw new Error('Card payment exists for this order');
  }
  if (
    order.isPre &&
    (order.cashAmount || order.mobileAmount || order.paidAmounts?.length)
  ) {
    throw new Error('Cannot cancel cause PreOrder added payment');
  }

  const before = await getOrderChangeSnapshot(models, _id, order);
  if (order.synced) {
    const result: { cancelled?: boolean } | undefined = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'pos',
      action: 'cancelOrder',
      method: 'mutation',
      input: { _id, posToken: order.posToken || token, userId },
      throwOnError: true,
    });
    if (!result?.cancelled) {
      throw new Error('Sales order cancellation was not confirmed');
    }
  }

  // Keep the audit snapshot after the order and its items are removed.
  await saveOrderCancellationSnapshot(models, order, token, userId, before);
  await models.PutResponses.deleteMany({
    ...getOrderReceiptQuery(_id),
    status: { $ne: 'SUCCESS' },
  });
  await models.OrderItems.deleteMany({ orderId: _id });
  return models.Orders.deleteOne({ _id });
};
