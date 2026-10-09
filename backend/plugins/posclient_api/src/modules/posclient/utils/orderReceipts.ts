import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '../@types/configs';
import { IOrderDocument } from '../@types/orders';
import { IPosUserDocument } from '../@types/posUsers';
import { IEbarimtDocument } from '../db/definitions/putResponses';

export const getOrderReceiptQuery = (orderId: string) => ({
  contentType: 'pos',
  contentId: orderId,
});

export const hasSuccessfulOrderReceipt = async (
  models: IModels,
  orderId: string,
): Promise<boolean> =>
  !!(await models.PutResponses.exists({
    ...getOrderReceiptQuery(orderId),
    status: 'SUCCESS',
  }));

export const assertNoUnresolvedOrderReceipts = async (
  models: IModels,
  orderId: string,
  operation: 'cancelling' | 'returning',
): Promise<void> => {
  if (
    await models.PutResponses.exists({
      ...getOrderReceiptQuery(orderId),
      $or: [{ status: { $exists: false } }, { status: null }, { status: '' }],
    })
  ) {
    throw new Error(
      `eBarimt request is unresolved. Check its result before ${operation}`,
    );
  }
};

export const returnOrderReceipts = async (
  models: IModels,
  order: IOrderDocument,
  config: IConfigDocument,
  posUser: IPosUserDocument,
): Promise<IEbarimtDocument[]> => {
  await assertNoUnresolvedOrderReceipts(models, order._id, 'returning');
  if (!(await hasSuccessfulOrderReceipt(models, order._id))) {
    return [];
  }
  if (!config.ebarimtConfig) {
    throw new Error('Please check ebarimt config');
  }
  const responses = await models.PutResponses.returnBill(
    { ...getOrderReceiptQuery(order._id), number: order.number ?? '' },
    config.ebarimtConfig,
    posUser,
  );
  if (!Array.isArray(responses)) {
    throw new TypeError(responses.error);
  }
  return responses;
};
