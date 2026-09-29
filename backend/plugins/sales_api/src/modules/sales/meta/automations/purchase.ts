import { IModels } from '~/connectionResolvers';
import { IDeal } from '../../@types';

// The loyalty action that reads a deal as a purchase.
export const LOYALTY_ADJUST_SCORE_ACTION = 'loyalty:score.score.create';

const isScoreProduct = (product: { tickUsed?: boolean }) => !!product.tickUsed;

/**
 * What was paid with money rather than points: the pipeline marks its point
 * payment types with a score campaign.
 */
export const dealPaidAmount = async (
  models: IModels,
  deal: Pick<IDeal, 'stageId' | 'totalAmount' | 'productsData' | 'paymentsData'>,
) => {
  const stage = deal.stageId
    ? await models.Stages.findOne({ _id: deal.stageId }).lean()
    : null;
  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;

  const pointPaymentTypes = new Set(
    (pipeline?.paymentTypes || [])
      .filter(({ scoreCampaignId }) => !!scoreCampaignId)
      .map(({ type }) => type),
  );
  const storedTotal = Number(deal.totalAmount);
  const totalAmount =
    deal.totalAmount === undefined || !Number.isFinite(storedTotal)
      ? (deal.productsData || [])
          .filter(isScoreProduct)
          .reduce((sum, product) => sum + (Number(product.amount) || 0), 0)
      : storedTotal;
  const pointsPaid = Object.entries(deal.paymentsData || {})
    .filter(([type]) => pointPaymentTypes.has(type))
    .reduce((sum, [, payment]) => sum + (Number(payment?.amount) || 0), 0);

  return Math.max(0, totalAmount - pointsPaid);
};

export const dealPurchaseItems = (deal: Pick<IDeal, 'productsData'>) =>
  (deal.productsData || []).filter(isScoreProduct).map((product) => ({
    productId: product.productId,
    amount:
      Number(product.amount) ||
      (Number(product.quantity) || 0) * (Number(product.unitPrice) || 0),
    discounted: Math.abs(Number(product.discount) || 0) >= 0.005,
  }));
