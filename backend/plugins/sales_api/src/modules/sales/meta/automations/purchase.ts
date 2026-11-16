import { IModels } from '~/connectionResolvers';
import { IDeal } from '../../@types';
import {
  pointsPaidAmount,
  stampWalletPayments,
} from '../../utils/walletPayments';

// The loyalty action that reads a deal as a purchase.
export const LOYALTY_ADJUST_SCORE_ACTION = 'loyalty:score.score.create';
// Set tier by amount bands reads the same purchase total.
export const LOYALTY_SET_TIER_ACTION = 'loyalty:score.tier.create';

const isScoreProduct = (product: { tickUsed?: boolean }) => !!product.tickUsed;

/**
 * What was paid with money rather than points: lines paid from a loyalty
 * wallet carry it (unsaved lines take it from the pipeline's wallet rows).
 */
export const dealPaidAmount = async (
  models: IModels,
  deal: Pick<
    IDeal,
    'stageId' | 'totalAmount' | 'productsData' | 'paymentsData'
  >,
) => {
  const stage = deal.stageId
    ? await models.Stages.findOne({ _id: deal.stageId }).lean()
    : null;
  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;

  const storedTotal = Number(deal.totalAmount);
  const totalAmount =
    deal.totalAmount === undefined || !Number.isFinite(storedTotal)
      ? (deal.productsData || [])
          .filter(isScoreProduct)
          .reduce((sum, product) => sum + (Number(product.amount) || 0), 0)
      : storedTotal;
  const pointsPaid = pointsPaidAmount(
    Object.values(
      stampWalletPayments(deal.paymentsData, pipeline?.paymentTypes) || {},
    ),
  );

  return Math.max(0, totalAmount - pointsPaid);
};

// What the deal earns on: the rows marked for score, before points.
export const dealScoreTotal = (deal: Pick<IDeal, 'productsData'>) =>
  (deal.productsData || [])
    .filter(isScoreProduct)
    .reduce((sum, product) => sum + (Number(product.amount) || 0), 0);

export const dealPurchaseItems = (deal: Pick<IDeal, 'productsData'>) =>
  (deal.productsData || []).filter(isScoreProduct).map((product) => ({
    productId: product.productId,
    amount:
      Number(product.amount) ||
      (Number(product.quantity) || 0) * (Number(product.unitPrice) || 0),
    discounted: Math.abs(Number(product.discount) || 0) >= 0.005,
  }));
