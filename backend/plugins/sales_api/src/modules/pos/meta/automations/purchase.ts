import { IModels } from '~/connectionResolvers';
import { IPosOrder } from '~/modules/pos/@types/orders';
import {
  pointsPaidAmount,
  stampWalletPaidAmounts,
} from '~/modules/sales/utils/walletPayments';

/**
 * What was paid with money rather than points: lines paid from a loyalty
 * wallet carry it (older orders take it from the POS's wallet rows).
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
  const pointsPaid = pointsPaidAmount(
    stampWalletPaidAmounts(order.paidAmounts, pos?.paymentTypes) || [],
  );

  return Math.max(0, (Number(order.totalAmount) || 0) - pointsPaid);
};

export const posOrderPurchaseItems = (order: Pick<IPosOrder, 'items'>) =>
  (order.items || []).map((item) => ({
    productId: item.productId,
    amount: (Number(item.count) || 0) * (Number(item.unitPrice) || 0),
    discounted: (Number(item.discountAmount) || 0) > 0,
  }));
