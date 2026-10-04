import { isEnabled, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const cancelSyncedPosOrder = async (
  models: IModels,
  subdomain: string,
  input: { _id: string; posToken: string; userId?: string },
) => {
  const { _id, posToken, userId } = input;
  const pos = await models.Pos.findOne({ token: posToken }).lean();
  if (!pos) {
    throw new Error('POS configuration not found');
  }
  const order = await models.PosOrders.findOne({ _id }).lean();
  if (order && (order.posId !== pos._id || order.posToken !== posToken)) {
    throw new Error('Order does not belong to this POS');
  }
  if (order?.status === 'return' || order?.returnInfo?.returnAt) {
    throw new Error('Returned orders must be retained');
  }
  if (order?.paidDate) {
    throw new Error(
      'Paid orders cannot be cancelled. Return the order instead',
    );
  }
  if (await isEnabled('mongolian')) {
    const receipts: { _id: string }[] | undefined = await sendTRPCMessage({
      subdomain,
      pluginName: 'mongolian',
      module: 'putResponses',
      action: 'find',
      method: 'query',
      input: {
        query: {
          contentType: 'pos',
          contentId: _id,
          $or: [
            { status: 'SUCCESS' },
            { status: { $exists: false } },
            { status: null },
            { status: '' },
          ],
        },
      },
      throwOnError: true,
    });
    if (!Array.isArray(receipts)) {
      throw new Error('Unable to verify synced eBarimt receipts');
    }
    if (receipts.length) {
      throw new Error(
        'Successful or unresolved eBarimt exists. Order cannot be deleted',
      );
    }
  }
  if (order) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      module: 'score',
      action: 'refund',
      method: 'mutation',
      input: {
        targetId: _id,
        description: 'POS order cancelled',
        actorId: userId || order.userId,
      },
      throwOnError: true,
    });
    await models.PosOrders.deleteOne({ _id, posId: pos._id, posToken });
  }
  // Missing rows are successful retries, allowing the client to finish cleanup.
  return { cancelled: true };
};
