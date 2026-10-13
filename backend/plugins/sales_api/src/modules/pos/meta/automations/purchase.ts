import { IModels } from '~/connectionResolvers';
import { IPosOrder } from '~/modules/pos/@types/orders';

/**
 * What was paid with money rather than points: the POS marks its point
 * payment types with a score campaign.
 */
export const posOrderPaidAmount = async (
  models: IModels,
  order: Pick<IPosOrder, 'posToken' | 'totalAmount' | 'paidAmounts'>,
) => {
  const pos = order.posToken
    ? await models.Pos.findOne(
        { token: order.posToken },
        { paymentTypes: 1 },
      ).lean()
    : null;
  const pointPaymentTypes = new Set(
    (pos?.paymentTypes || [])
      .filter(({ scoreCampaignId }) => !!scoreCampaignId)
      .map(({ type }) => type),
  );
  const pointsPaid = (order.paidAmounts || [])
    .filter(({ type }) => pointPaymentTypes.has(type))
    .reduce((sum, { amount }) => sum + (Number(amount) || 0), 0);

  return Math.max(0, (Number(order.totalAmount) || 0) - pointsPaid);
};

export const posOrderPurchaseItems = (order: Pick<IPosOrder, 'items'>) =>
  (order.items || []).map((item) => ({
    productId: item.productId,
    amount: (Number(item.count) || 0) * (Number(item.unitPrice) || 0),
    discounted: (Number(item.discountAmount) || 0) > 0,
  }));
