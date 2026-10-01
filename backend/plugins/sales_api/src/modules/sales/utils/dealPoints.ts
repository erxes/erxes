import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import { PROBABILITY } from '~/modules/sales/constants';
import { getCustomerIds } from '~/modules/sales/utils';

// The record loyalty ties these points to.
const DEAL_TARGET_TYPE = 'sales:sales.deals';

type TStageRefund = { probability?: string; refundPoints?: boolean | null };

/** Unset keeps what it always meant: a lost stage gives points back. */
export const stageRefundsPoints = (stage?: TStageRefund | null) =>
  stage?.refundPoints ?? stage?.probability === PROBABILITY.LOST;

type TDealSpend = { campaignId: string; pointsPaymentAmount: number };

type TDealPointsPlan =
  | { kind: 'none' }
  | { kind: 'refund' }
  | {
      kind: 'spend';
      customerId: string;
      totalAmount: number;
      spends: TDealSpend[];
    };

const NOTHING: TDealPointsPlan = { kind: 'none' };

const toPlain = (deal?: IDeal): IDeal | undefined =>
  (deal as (IDeal & { toObject?: () => IDeal }) | undefined)?.toObject?.() ||
  deal;

const pointPaymentCampaigns = (pipeline?: { paymentTypes?: any[] } | null) =>
  new Map<string, string>(
    (pipeline?.paymentTypes || [])
      .filter(({ scoreCampaignId }) => !!scoreCampaignId)
      .map(({ type, scoreCampaignId }) => [type, scoreCampaignId]),
  );

const amountOf = (deal: IDeal | undefined, type: string) =>
  Number(deal?.paymentsData?.[type]?.amount) || 0;

/** What moving from `oldDeal` to `deal` asks of loyalty. */
export const planDealPoints = async ({
  subdomain,
  models,
  dealId,
  deal,
  oldDeal,
  customerIds,
}: {
  subdomain: string;
  models: IModels;
  dealId: string;
  deal: IDeal;
  oldDeal?: IDeal;
  // A deal not saved yet has no relations to read its customer from.
  customerIds?: string[];
}): Promise<TDealPointsPlan> => {
  const current = toPlain(deal);
  const previous = toPlain(oldDeal);

  if (!current?.stageId) {
    return NOTHING;
  }

  const moved = !!previous && previous.stageId !== current.stageId;
  const [stage, previousStage] = await Promise.all([
    models.Stages.findOne({ _id: current.stageId }).lean(),
    moved
      ? models.Stages.findOne({ _id: previous?.stageId }).lean()
      : Promise.resolve(null),
  ]);
  const leftRefund = moved && stageRefundsPoints(previousStage);

  if (stageRefundsPoints(stage)) {
    // Entering it gives everything back; while there nothing is spent.
    return moved && !leftRefund ? { kind: 'refund' } : NOTHING;
  }

  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;

  // Leaving a refunding stage takes again what the deal pays with points.
  const spends = [...pointPaymentCampaigns(pipeline)]
    .map(([type, campaignId]) => ({
      campaignId,
      pointsPaymentAmount: amountOf(current, type),
      before: leftRefund ? 0 : amountOf(previous, type),
    }))
    .filter(({ pointsPaymentAmount, before }) => pointsPaymentAmount !== before)
    .map(({ campaignId, pointsPaymentAmount }) => ({
      campaignId,
      pointsPaymentAmount,
    }));

  if (!spends.length) {
    return NOTHING;
  }

  const [customerId] =
    customerIds ?? ((await getCustomerIds(subdomain, dealId)) || []);

  if (!customerId) {
    if (spends.some(({ pointsPaymentAmount }) => pointsPaymentAmount > 0)) {
      throw new Error('Attach a customer to pay with points');
    }

    return NOTHING;
  }

  return {
    kind: 'spend',
    customerId,
    totalAmount: Number(current.totalAmount) || 0,
    spends,
  };
};

/** A copied deal is a new order: it does not pay with the original's points. */
export const withoutPointPayments = async (
  models: IModels,
  stageId: string,
  paymentsData?: IDeal['paymentsData'],
) => {
  if (!paymentsData) {
    return paymentsData;
  }

  const stage = await models.Stages.findOne({ _id: stageId }).lean();
  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;
  const pointTypes = pointPaymentCampaigns(pipeline);

  return Object.fromEntries(
    Object.entries(paymentsData).filter(([type]) => !pointTypes.has(type)),
  );
};

const askLoyalty = (
  subdomain: string,
  action: 'checkSpend' | 'spend' | 'refund',
  input: Record<string, unknown>,
) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: action === 'checkSpend' ? 'query' : 'mutation',
    module: 'score',
    action,
    input,
    throwOnError: true,
  });

const spendInputs = (
  dealId: string,
  plan: Extract<TDealPointsPlan, { kind: 'spend' }>,
  actorId?: string,
) =>
  plan.spends.map(({ campaignId, pointsPaymentAmount }) => ({
    ownerType: 'customer',
    ownerId: plan.customerId,
    campaignId,
    targetId: dealId,
    targetType: DEAL_TARGET_TYPE,
    serviceName: 'sales',
    pointsPaymentAmount,
    totalAmount: plan.totalAmount,
    actorId,
  }));

/** Loyalty's rules, asked before anything is saved. */
export const checkDealPoints = async (
  subdomain: string,
  dealId: string,
  plan: TDealPointsPlan,
) => {
  if (plan.kind !== 'spend') {
    return;
  }

  for (const input of spendInputs(dealId, plan)) {
    await askLoyalty(subdomain, 'checkSpend', input);
  }
};

export const refundDealPoints = (
  subdomain: string,
  dealId: string,
  description: string,
  actorId?: string,
) =>
  askLoyalty(subdomain, 'refund', { targetId: dealId, description, actorId });

/**
 * Records in loyalty what a saved deal paid with points, or gives it back.
 * Earning is not decided here: automations do it.
 */
export const syncDealPoints = async ({
  subdomain,
  models,
  dealId,
  deal,
  oldDeal,
  userId,
}: {
  subdomain: string;
  models: IModels;
  dealId: string;
  deal: IDeal;
  oldDeal?: IDeal;
  userId?: string;
}) => {
  const plan = await planDealPoints({
    subdomain,
    models,
    dealId,
    deal,
    oldDeal,
  });

  if (plan.kind === 'refund') {
    await refundDealPoints(
      subdomain,
      dealId,
      'Deal moved to a refund stage',
      userId,
    );
    return;
  }

  if (plan.kind !== 'spend') {
    return;
  }

  try {
    for (const input of spendInputs(dealId, plan, userId)) {
      await askLoyalty(subdomain, 'spend', input);
    }
  } catch (error) {
    // Checked before the save, so only a race lands here; the deal goes back
    // to what it paid and where it stood.
    const previous = toPlain(oldDeal);

    if (previous) {
      await models.Deals.updateDeal(dealId, {
        paymentsData: previous.paymentsData || {},
        stageId: previous.stageId,
      });
    }

    throw error;
  }
};
