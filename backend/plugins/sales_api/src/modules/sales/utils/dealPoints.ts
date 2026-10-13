import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal } from '~/modules/sales/@types';
import {
  dealPaidAmount,
  dealPurchaseItems,
  dealScoreTotal,
} from '~/modules/sales/meta/automations/purchase';
import { getCustomerIds } from '~/modules/sales/utils';
import {
  resolveLoyaltyRules,
  resolveLoyaltyTierRule,
  TLoyaltyRule,
  TLoyaltyTierBand,
  TLoyaltyTierRule,
  TResolvedLoyaltyRules,
} from './loyaltyRules';

// The record loyalty ties these points to.
const DEAL_TARGET_TYPE = 'sales:sales.deals';

type TDealSpend = { campaignId: string; pointsPaymentAmount: number };

type TDealEarn = {
  campaignId: string;
  ruleId: string;
  totalAmount: number;
  paidAmount: number;
  items: ReturnType<typeof dealPurchaseItems>;
};

type TDealTier = {
  accountTypeId: string;
  bands: TLoyaltyTierBand[];
  onlyUpgrade?: boolean;
  totalAmount: number;
};

type TDealPointsPlan =
  | { kind: 'none' }
  | { kind: 'refund' }
  | {
      kind: 'sync';
      customerId?: string;
      totalAmount: number;
      spends: TDealSpend[];
      earns: TDealEarn[];
      tier?: TDealTier;
    };

const NOTHING: TDealPointsPlan = { kind: 'none' };

const NO_RULES: TResolvedLoyaltyRules = { earns: [], refunds: false };

const toPlain = (deal?: IDeal): IDeal | undefined =>
  (deal as (IDeal & { toObject?: () => IDeal }) | undefined)?.toObject?.() ||
  deal;

// What loyalty shows the deal as, kept with the change it made.
const dealName = (deal: IDeal, dealId: string) => {
  const { name, number } = toPlain(deal) || {};

  return name || (number ? `#${number}` : dealId);
};

const pointPaymentCampaigns = (pipeline?: { paymentTypes?: any[] } | null) =>
  new Map<string, string>(
    (pipeline?.paymentTypes || [])
      .filter(({ scoreCampaignId }) => !!scoreCampaignId)
      .map(({ type, scoreCampaignId }) => [type, scoreCampaignId]),
  );

const amountOf = (deal: IDeal | undefined, type: string) =>
  Number(deal?.paymentsData?.[type]?.amount) || 0;

const loadStagePlace = async (models: IModels, stageId?: string) => {
  const stage = stageId
    ? await models.Stages.findOne({ _id: stageId }).lean()
    : null;
  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;

  return { stage, pipeline };
};

const rulesAt = (
  rules: TLoyaltyRule[],
  { stage, pipeline }: Awaited<ReturnType<typeof loadStagePlace>>,
) =>
  stage
    ? resolveLoyaltyRules(rules, {
        boardId: pipeline?.boardId,
        pipelineId: stage.pipelineId,
        stageId: stage._id,
        probability: stage.probability,
      })
    : NO_RULES;

const tierAt = (
  rules: TLoyaltyTierRule[],
  { stage, pipeline }: Awaited<ReturnType<typeof loadStagePlace>>,
) =>
  stage
    ? resolveLoyaltyTierRule(rules, {
        boardId: pipeline?.boardId,
        pipelineId: stage.pipelineId,
        stageId: stage._id,
        probability: stage.probability,
      })
    : null;

/**
 * What moving from `oldDeal` to `deal` asks of loyalty. Earning follows where
 * the deal stands, not how it got there: every save in an earning stage
 * restates the purchase, so edits and a return from a refund stage count.
 */
export const planDealPoints = async ({
  models,
  subdomain,
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
  const [here, before, rules, tierRules] = await Promise.all([
    loadStagePlace(models, current.stageId),
    moved
      ? loadStagePlace(models, previous?.stageId)
      : Promise.resolve({ stage: null, pipeline: null }),
    models.LoyaltyRules.find({}).lean() as Promise<TLoyaltyRule[]>,
    models.LoyaltyTierRules.find({}).lean() as Promise<TLoyaltyTierRule[]>,
  ]);
  const now = rulesAt(rules, here);
  const leftRefund = moved && rulesAt(rules, before).refunds;

  if (now.refunds) {
    // Entering it gives everything back; while there nothing is spent.
    return moved && !leftRefund ? { kind: 'refund' } : NOTHING;
  }

  // Leaving a refunding stage takes again what the deal pays with points.
  const spends = [...pointPaymentCampaigns(here.pipeline)]
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

  const purchase = now.earns.length
    ? {
        totalAmount: dealScoreTotal(current),
        paidAmount: await dealPaidAmount(models, current),
        items: dealPurchaseItems(current),
      }
    : null;
  const earns = purchase
    ? now.earns.map(({ campaignId, ruleId }) => ({
        campaignId,
        ruleId,
        ...purchase,
      }))
    : [];

  const tierRule = tierAt(tierRules, here);
  const tier: TDealTier | undefined = tierRule
    ? {
        accountTypeId: tierRule.accountTypeId,
        bands: tierRule.bands,
        onlyUpgrade: tierRule.onlyUpgrade,
        totalAmount: dealScoreTotal(current),
      }
    : undefined;

  if (!spends.length && !earns.length && !tier) {
    return NOTHING;
  }

  // Earning and paying with points go to the same, first customer.
  const [customerId] =
    customerIds ?? ((await getCustomerIds(subdomain, dealId)) || []);

  if (!customerId) {
    if (spends.some(({ pointsPaymentAmount }) => pointsPaymentAmount > 0)) {
      throw new Error('Attach a customer to pay with points');
    }

    return earns.length || tier
      ? {
          kind: 'sync',
          customerId: undefined,
          totalAmount: Number(current.totalAmount) || 0,
          spends: [],
          earns,
          tier,
        }
      : NOTHING;
  }

  return {
    kind: 'sync',
    customerId,
    totalAmount: Number(current.totalAmount) || 0,
    spends,
    earns,
    tier,
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
  action: 'checkSpend' | 'spend' | 'earn' | 'refund' | 'applyPurchaseTier',
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
  plan: Extract<TDealPointsPlan, { kind: 'sync' }>,
  actorId?: string,
) =>
  plan.spends.map(({ campaignId, pointsPaymentAmount }) => ({
    ownerType: 'customer',
    ownerId: plan.customerId as string,
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
  if (plan.kind !== 'sync') {
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
 * Records in loyalty what a saved deal paid with points and what it earns,
 * or gives everything back.
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

  if (plan.kind !== 'sync') {
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

  // Nobody to earn for until a customer is attached; the next save earns.
  if (!plan.customerId) {
    return;
  }

  for (const { campaignId, totalAmount, paidAmount, items } of plan.earns) {
    await askLoyalty(subdomain, 'earn', {
      ownerType: 'customer',
      ownerId: plan.customerId,
      campaignId,
      targetId: dealId,
      targetType: DEAL_TARGET_TYPE,
      serviceName: 'sales',
      actorId: userId,
      purchase: { totalAmount, paidAmount, items },
    });
  }

  // Never given back: a tier is set again by the next purchase, not undone.
  if (plan.tier) {
    const { accountTypeId, bands, onlyUpgrade, totalAmount } = plan.tier;

    await askLoyalty(subdomain, 'applyPurchaseTier', {
      ownerType: 'customer',
      ownerId: plan.customerId,
      accountTypeId,
      bands,
      onlyUpgrade,
      totalAmount,
      targetId: dealId,
      targetType: DEAL_TARGET_TYPE,
      targetName: dealName(deal, dealId),
      actorId: userId,
    });
  }
};

/**
 * Points for deals written outside the deal mutations (other plugins,
 * invoices, automations): each is compared with how it was before.
 */
export const syncWrittenDealPoints = async ({
  subdomain,
  models,
  before = [],
  dealIds,
  userId,
}: {
  subdomain: string;
  models: IModels;
  before?: (IDeal & { _id: string })[];
  dealIds?: string[];
  userId?: string;
}) => {
  const ids = dealIds ?? before.map(({ _id }) => _id);

  if (!ids.length) {
    return;
  }

  const written = (await models.Deals.find({
    _id: { $in: ids },
  }).lean()) as (IDeal & { _id: string })[];

  for (const deal of written) {
    await syncDealPoints({
      subdomain,
      models,
      dealId: deal._id,
      deal,
      oldDeal: before.find(({ _id }) => _id === deal._id),
      userId,
    });
  }
};
