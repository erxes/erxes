import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getOrderChangeSnapshot } from './orderChangeLogs';

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

  const receiptQuery = { contentType: 'pos', contentId: _id };
  if (
    await models.PutResponses.exists({ ...receiptQuery, status: 'SUCCESS' })
  ) {
    throw new Error(
      'Successful eBarimt exists. Return the order instead of cancelling it',
    );
  }
  if (
    await models.PutResponses.exists({
      ...receiptQuery,
      $or: [{ status: { $exists: false } }, { status: null }, { status: '' }],
    })
  ) {
    throw new Error(
      'eBarimt request is unresolved. Check its result before cancelling',
    );
  }
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

  const before = await getOrderChangeSnapshot(models, _id);
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
  await models.OrderChangeLogs.createLog({
    action: 'cancel',
    orderId: _id,
    posToken: token,
    userId,
    changes: [
      {
        field: 'order',
        oldValue: { ...order, items: before.items },
        newValue: null,
      },
      { field: 'items', oldValue: before.items, newValue: [] },
    ],
  });
  await models.PutResponses.deleteMany({
    ...receiptQuery,
    status: { $ne: 'SUCCESS' },
  });
  await models.OrderItems.deleteMany({ orderId: _id });
  return models.Orders.deleteOne({ _id });
};
