import { IModels } from '~/connectionResolvers';
import { IPosOrder } from './@types/orders';
import { IPosEarnTier } from './@types/pos';
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
  | {
      kind: 'sync';
      customerId?: string;
      earns: TOrderEarn[];
      tier?: IPosEarnTier & { totalAmount: number };
    };

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
    { earnScoreCampaignId: 1, earnTier: 1 },
  ).lean();
  const campaignId = pos?.earnScoreCampaignId;
  const earnTier = pos?.earnTier;

  if (!campaignId && !earnTier) {
    return { kind: 'none' };
  }

  const totalAmount = Number(order.totalAmount) || 0;
  const earns = campaignId
    ? [
        {
          campaignId,
          totalAmount,
          paidAmount: await posOrderPaidAmount(models, order),
          items: posOrderPurchaseItems(order),
        },
      ]
    : [];

  return {
    kind: 'sync',
    customerId: order.customerId || undefined,
    earns,
    tier: earnTier ? { ...earnTier, totalAmount } : undefined,
  };
};

/** A POS tier needs a wallet and a tier on every band; none clears it. */
export const validateEarnTier = (earnTier?: IPosEarnTier | null) => {
  if (!earnTier) {
    return;
  }

  if (!earnTier.accountTypeId) {
    throw new Error('Choose a wallet for the tier');
  }

  if (!earnTier.bands?.length || earnTier.bands.some(({ tier }) => !tier)) {
    throw new Error('Give every tier band a tier');
  }
};
