import { IModels } from '~/connectionResolvers';
import { IPosOrder } from './@types/orders';
import {
  posOrderPaidAmount,
  posOrderPurchaseItems,
} from './meta/automations/purchase';

type TOrderEarn = {
  campaignId: string;
  totalAmount: number;
  paidAmount: number;
  items: ReturnType<typeof posOrderPurchaseItems>;
};

type TOrderPointsPlan =
  | { kind: 'none' }
  | { kind: 'refund' }
  | { kind: 'sync'; customerId?: string; earns: TOrderEarn[] };

const RETURNED = 'return';

/**
 * What a synced order asks of loyalty: a returned one gives everything back,
 * a paid one restates what it earns, so syncing it again changes nothing.
 */
export const planOrderPoints = async ({
  models,
  order,
}: {
  models: IModels;
  order: IPosOrder;
}): Promise<TOrderPointsPlan> => {
  if (order.status === RETURNED) {
    return { kind: 'refund' };
  }

  if (!order.paidDate) {
    return { kind: 'none' };
  }

  const pos = await models.Pos.findOne(
    { token: order.posToken },
    { earnScoreCampaignId: 1 },
  ).lean();
  const campaignId = pos?.earnScoreCampaignId;

  if (!campaignId) {
    return { kind: 'none' };
  }

  const purchase = {
    totalAmount: Number(order.totalAmount) || 0,
    paidAmount: await posOrderPaidAmount(models, order),
    items: posOrderPurchaseItems(order),
  };

  return {
    kind: 'sync',
    customerId: order.customerId || undefined,
    earns: [{ campaignId, ...purchase }],
  };
};
