import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal, IProductData } from '~/modules/sales/@types';
import { getCompanyIds, getCustomerIds } from '~/modules/sales/utils';

const createBonusProductDataId = (productId: string) => {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

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
    if (item.discountPercent) {
      continue;
    }

    const loyalty = loyalties[item.productId];

    if (!loyalty?.discount) {
      continue;
    }

    item.unitPrice = item.unitPrice || 0;
    item.discountPercent = loyalty.discount;
    item.discount = fixNum(
      ((item.quantity * item.unitPrice) / 100) * loyalty.discount,
    );
    item.amount = fixNum(
      (item.unitPrice - (item.unitPrice / 100) * loyalty.discount) *
        item.quantity,
    );
  }

  return (deal.productsData || [])
    .filter((pd) => !pd.bonusCount)
    .map((pd) => activeProductsData.find((apd) => apd._id === pd._id) || pd);
};

export const checkPricing = async (
  subdomain: string,
  models: IModels,
  deal: IDeal,
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
    const discount = pricing[item._id || ''];

    if (!discount) {
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
      item.discountPercent = fixNum(
        (discount.value * 100) / (item.unitPrice || 1),
        8,
      );
      item.discount = fixNum(discount.value * item.quantity);
      item.amount = fixNum((item.unitPrice - discount.value) * item.quantity);
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
      } as IProductData),
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

export const doScoreCampaign = async (
  subdomain: string,
  models: IModels,
  _id: string,
  deal: IDeal,
  oldDeal?: IDeal,
) => {
  if (!deal?.stageId) {
    return;
  }

  const target = (deal as any)?.toObject?.() || deal;
  const oldTarget = (oldDeal as any)?.toObject?.() || oldDeal;

  const [oldStage, currentStage, [customerId], [companyId]] =
    await Promise.all([
      oldTarget?.stageId
        ? models.Stages.findOne({ _id: oldTarget.stageId }).lean()
        : null,
      models.Stages.findOne({ _id: target.stageId }).lean(),
      getCustomerIds(subdomain, _id),
      getCompanyIds(subdomain, _id),
    ]);

  const [oldPipeline, currentPipeline] = await Promise.all([
    oldStage?.pipelineId
      ? models.Pipelines.findOne({ _id: oldStage.pipelineId }).lean()
      : null,
    currentStage?.pipelineId
      ? models.Pipelines.findOne({ _id: currentStage.pipelineId }).lean()
      : null,
  ]);

  let cpUserId: string | undefined;
  if (customerId) {
    const cpUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input: { erxesCustomerId: customerId },
      defaultValue: null,
    });
    cpUserId = cpUser?._id;
  }

  const ownerHints = Object.fromEntries(
    Object.entries({
      customer: customerId,
      company: companyId,
      user: target.userId,
      cpUser: cpUserId,
    }).filter(([, value]) => !!value),
  );

  return sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'score',
    action: 'consumeTargetChange',
    input: {
      contentType: 'sales:deal',
      serviceName: 'sales',
      targetId: _id,
      target,
      oldTarget,
      stageContexts: {
        old: {
          stage: oldStage,
          pipeline: oldPipeline,
        },
        current: {
          stage: currentStage,
          pipeline: currentPipeline,
        },
      },
      ownerHints,
    },
    defaultValue: null,
  });
};
