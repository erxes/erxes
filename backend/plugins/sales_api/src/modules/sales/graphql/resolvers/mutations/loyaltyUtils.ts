import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal, IProductData } from '~/modules/sales/@types';
import { PROBABILITY } from '~/modules/sales/constants';
import { getCompanyIds, getCustomerIds } from '~/modules/sales/utils';
import {
  applyDiscountInfo,
  ensureHandDiscountInfo,
  recalculateProductDiscount,
} from '~/modules/sales/utils/discountInfos';

const createBonusProductDataId = (productId: string) => {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

function toPlainDeal(deal: IDeal): IDeal;
function toPlainDeal(deal?: IDeal): IDeal | undefined;
function toPlainDeal(deal?: IDeal) {
  const maybeDocument = deal as
    | (IDeal & { toObject?: () => IDeal })
    | undefined;
  return maybeDocument?.toObject?.() || maybeDocument;
}

export const checkLoyalties = async (
  subdomain: string,
  _id: string,
  deal: IDeal,
) => {
  const activeProductsData =
    deal.productsData?.filter((pd) => pd.tickUsed && !pd.bonusCount) || [];

  if (!activeProductsData.length) {
    return deal.productsData;
  }

  const [customerId] = (await getCustomerIds(subdomain, _id)) || [];

  if (!customerId) {
    return deal.productsData;
  }

  const totalAmount = activeProductsData.reduce(
    (sum, pd) => sum + (pd.amount || 0),
    0,
  );

  const loyalties = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    module: 'loyalty',
    action: 'checkLoyalties',
    input: {
      ownerType: 'customer',
      ownerId: customerId,
      totalAmount,
      products: activeProductsData.map((item) => ({
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    },
    defaultValue: {},
  });

  for (const item of activeProductsData) {
    item.discountInfos = ensureHandDiscountInfo(item);

    const loyalty = loyalties[item.productId];

    if (!loyalty?.discount) {
      recalculateProductDiscount(item);
      continue;
    }

    item.unitPrice = item.unitPrice || 0;
    applyDiscountInfo(item, {
      type: 'voucher',
      title: 'Loyalty discount',
      amount: fixNum(
        ((item.quantity * item.unitPrice) / 100) * loyalty.discount,
      ),
      percent: loyalty.discount,
    });
  }

  return (deal.productsData || [])
    .filter((pd) => !pd.bonusCount)
    .map((pd) => activeProductsData.find((apd) => apd._id === pd._id) || pd);
};

export const checkPricing = async (
  subdomain: string,
  models: IModels,
  deal: IDeal & { _id?: string },
) => {
  const activeProductsData =
    deal.productsData?.filter((pd) => pd.tickUsed && !pd.bonusCount) || [];

  if (!activeProductsData.length) {
    return deal.productsData;
  }

  const stage = await models.Stages.getStage(deal.stageId);
  const totalAmount = activeProductsData.reduce(
    (sum, pd) => sum + (pd.amount || 0),
    0,
  );

  let customerType: 'company' | 'customer' = 'customer';
  let pricingCustomerId = '';

  if (deal._id) {
    const [companyId] = (await getCompanyIds(subdomain, deal._id)) || [];

    if (companyId) {
      customerType = 'company';
      pricingCustomerId = companyId;
    } else {
      const [customerId] = (await getCustomerIds(subdomain, deal._id)) || [];
      pricingCustomerId = customerId || '';
    }
  }

  const pricing = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    module: 'pricing',
    action: 'checkPricing',
    input: {
      prioritizeRule: 'exclude',
      totalAmount,
      departmentId: deal.departmentIds?.[0] || '',
      branchId: deal.branchIds?.[0] || '',
      pipelineId: stage.pipelineId,
      customerType,
      customerId: pricingCustomerId,
      brokerType: deal.brokerType || '',
      brokerId: deal.brokerId || '',
      products: activeProductsData.map((item) => ({
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    },
    defaultValue: {},
  });

  const bonusProductsToAdd: Record<string, { count: number }> = {};

  for (const item of activeProductsData) {
    item.discountInfos = ensureHandDiscountInfo(item);

    const discount = pricing[item._id || ''];

    if (!discount) {
      recalculateProductDiscount(item);
      continue;
    }

    for (const bonusProductId of discount.bonusProducts || []) {
      if (bonusProductsToAdd[bonusProductId]) {
        bonusProductsToAdd[bonusProductId].count += 1;
      } else {
        bonusProductsToAdd[bonusProductId] = { count: 1 };
      }
    }

    if (discount.value) {
      applyDiscountInfo(item, {
        type: 'pricing',
        title: 'Pricing discount',
        amount: fixNum(discount.value * item.quantity),
        percent: fixNum((discount.value * 100) / (item.unitPrice || 1), 8),
      });
    }
  }

  const addBonusPData: IProductData[] = Object.keys(bonusProductsToAdd).map(
    (bonusProductId) =>
      ({
        _id: createBonusProductDataId(bonusProductId),
        productId: bonusProductId,
        bonusCount: bonusProductsToAdd[bonusProductId].count,
        unitPrice: 0,
        quantity: bonusProductsToAdd[bonusProductId].count,
        amount: 0,
        tickUsed: true,
      }) as IProductData,
  );

  return [
    ...(deal.productsData || [])
      .filter((pd) => !pd.bonusCount)
      .map((pd) => activeProductsData.find((apd) => apd._id === pd._id) || pd),
    ...addBonusPData,
  ];
};

export const confirmLoyalties = async (
  subdomain: string,
  _id: string,
  deal: IDeal,
) => {
  const confirmItems = deal.productsData || [];

  if (!confirmItems.length) {
    return;
  }

  const [customerId] = (await getCustomerIds(subdomain, _id)) || [];

  await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'loyalty',
    action: 'confirmLoyalties',
    input: {
      checkInfo: {},
      extraInfo: {
        ...deal.extraData,
        ownerType: 'customer',
        ownerId: customerId || null,
        targetType: 'sales',
        targetId: _id,
      },
    },
    defaultValue: null,
  });
};

// The record loyalty ties these points to.
const DEAL_TARGET_TYPE = 'sales:sales.deals';

const pointPaymentCampaigns = (pipeline?: { paymentTypes?: any[] } | null) =>
  new Map<string, string>(
    (pipeline?.paymentTypes || [])
      .filter(({ scoreCampaignId }) => !!scoreCampaignId)
      .map(({ type, scoreCampaignId }) => [type, scoreCampaignId]),
  );

/**
 * Tells loyalty what this deal paid with points, and takes everything back
 * when the deal is lost. Earning is not decided here: automations do it.
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
  if (!deal?.stageId) {
    return;
  }

  const current = toPlainDeal(deal);
  const previous = toPlainDeal(oldDeal);
  const stage = await models.Stages.findOne({ _id: current.stageId }).lean();

  if (
    stage?.probability === PROBABILITY.LOST &&
    previous?.stageId !== current.stageId
  ) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'mutation',
      module: 'score',
      action: 'refund',
      input: { targetId: dealId, description: 'Deal lost', actorId: userId },
      defaultValue: null,
    });

    return;
  }

  const pipeline = stage
    ? await models.Pipelines.findOne({ _id: stage.pipelineId }).lean()
    : null;
  const campaigns = pointPaymentCampaigns(pipeline);

  if (!campaigns.size) {
    return;
  }

  const [customerId] = (await getCustomerIds(subdomain, dealId)) || [];

  if (!customerId) {
    return;
  }

  const amountOf = (target: IDeal | undefined, type: string) =>
    Number(target?.paymentsData?.[type]?.amount) || 0;
  const totalAmount = Number(current.totalAmount) || 0;

  for (const [type, campaignId] of campaigns) {
    const pointsPaymentAmount = amountOf(current, type);

    // Unchanged payments were already recorded.
    if (previous && pointsPaymentAmount === amountOf(previous, type)) {
      continue;
    }

    await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'mutation',
      module: 'score',
      action: 'spend',
      input: {
        ownerType: 'customer',
        ownerId: customerId,
        campaignId,
        targetId: dealId,
        targetType: DEAL_TARGET_TYPE,
        serviceName: 'sales',
        pointsPaymentAmount,
        totalAmount,
        actorId: userId,
      },
    });
  }
};
