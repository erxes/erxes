import { canGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { checkUserIds, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDeal, IDealDocument, IProductData } from '~/modules/sales/@types';
import {
  createRelations,
  getCompanyIds,
  getCustomerIds,
  getNewOrder,
  sendNotifications,
} from '~/modules/sales/utils';
import {
  changeItemStatus,
  checkAssignedUserFromPData,
  copyPipelineLabels,
  itemMover,
  subscriptionWrapper,
} from '../utils';

export const addDeal = async ({
  models,
  subdomain,
  doc,
  user,
}: {
  models: IModels;
  subdomain: string;
  doc: IDeal & { processId: string; aboveItemId: string };
  user: IUserDocument;
}) => {
  doc.initialStageId = doc.stageId;
  doc.watchedUserIds = user && [user._id];

  const extendedDoc = {
    ...doc,
    modifiedBy: user?._id,
    userId: user ? user._id : doc.userId,
    order: await getNewOrder({
      collection: models.Deals,
      stageId: doc.stageId,
      aboveItemId: doc.aboveItemId,
    }),
  };

  if (extendedDoc.propertiesData) {
    // clean custom field values
    extendedDoc.propertiesData = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: extendedDoc.propertiesData,
      defaultValue: {},
    });
  }

  const deal = await models.Deals.createDeal(extendedDoc);

  const stage = await models.Stages.getStage(deal.stageId);

  await createRelations(subdomain, {
    dealId: deal._id,
    companyIds: doc.companyIds,
    customerIds: doc.customerIds,
  });

  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  await sendNotifications(models, subdomain, {
    item: deal,
    user,
    action: `invited you to the ${pipeline.name}`,
    content: `'${deal.name}'.`,
  });

  await subscriptionWrapper(models, {
    action: 'create',
    deal,
    pipelineId: stage.pipelineId,
  });
  return deal;
};

export const processStageChangeScoreCampaigns = async ({
  subdomain,
  models,
  deal,
  newStageId,
  user,
}: {
  subdomain: string;
  models: IModels;
  deal: IDealDocument | (IDeal & { _id: string });
  newStageId: string;
  user: IUserDocument;
}) => {
  try {
    const stage = await models.Stages.getStage(newStageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

    const result = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      method: 'query',
      module: 'score',
      action: 'getScoreCampaignsByStage',
      input: {
        boardId: pipeline.boardId,
        pipelineId: stage.pipelineId,
        stageId: newStageId,
      },
      defaultValue: [],
    });

    const campaigns = getTRPCData(result, []);

    if (!campaigns.length) {
      return;
    }

    const freshDeal = await models.Deals.findOne({ _id: deal._id }).lean();

    if (!freshDeal) {
      return;
    }

    for (const campaign of campaigns) {
      const rule = campaign.additionalConfig?.cardBasedRule?.find(
        (cardRule: any) => cardRule.stageIds?.includes(newStageId),
      );

      if (!rule) {
        continue;
      }

      const ownerType = campaign.ownerType || 'customer';
      let ownerId: string | undefined;

      if (ownerType === 'customer') {
        const [customerId] =
          (await getCustomerIds(subdomain, freshDeal._id)) || [];
        ownerId = customerId;
      } else if (ownerType === 'company') {
        const [companyId] =
          (await getCompanyIds(subdomain, freshDeal._id)) || [];
        ownerId = companyId;
      } else if (ownerType === 'user') {
        ownerId = user._id;
      }

      if (!ownerId) {
        continue;
      }

      await sendTRPCMessage({
        subdomain,
        pluginName: 'loyalty',
        method: 'mutation',
        module: 'score',
        action: 'doScoreCampaign',
        input: {
          ownerType,
          ownerId,
          campaignId: campaign._id,
          target: freshDeal,
          actionMethod: rule.actionMethod || 'add',
          serviceName: 'sales',
          targetId: freshDeal._id,
        },
        defaultValue: null,
      });
    }
  } catch (error) {
    console.error(
      'Error processing stage-change score campaigns:',
      error instanceof Error ? error.message : error,
    );
  }
};

export const editDeal = async ({
  user,
  models,
  subdomain,
  _id,
  processId,
  doc,
}: {
  models: IModels;
  subdomain: string;
  _id: string;
  doc: IDeal;
  processId: string;
  user: IUserDocument;
}) => {
  const oldDeal = await models.Deals.getDeal(_id);

  if (doc.assignedUserIds) {
    const { removedUserIds } = checkUserIds(
      oldDeal.assignedUserIds,
      doc.assignedUserIds,
    );
    const oldAssignedUserPdata = (oldDeal.productsData || [])
      .filter((pdata) => pdata.assignUserId)
      .map((pdata) => pdata.assignUserId || '');
    const cantRemoveUserIds = removedUserIds.filter((userId) =>
      oldAssignedUserPdata.includes(userId),
    );

    if (cantRemoveUserIds.length > 0) {
      throw new Error(
        'Cannot remove the team member, it is assigned in the product / service section',
      );
    }
  }

  if (doc.productsData) {
    const { assignedUserIds } = checkAssignedUserFromPData(
      oldDeal.assignedUserIds,
      doc.productsData
        .filter((pdata) => pdata.assignUserId)
        .map((pdata) => pdata.assignUserId || ''),
      oldDeal.productsData,
    );

    doc.assignedUserIds = assignedUserIds;

    doc.productsData = await checkLoyalties(subdomain, _id, {
      ...oldDeal.toObject?.(),
      ...oldDeal,
      ...doc,
    });

    doc.productsData = await checkPricing(subdomain, models, {
      ...oldDeal.toObject?.(),
      ...oldDeal,
      ...doc,
    });
  }

  const extendedDoc = {
    ...doc,
    modifiedAt: new Date(),
    modifiedBy: user._id,
  };

  const stage = await models.Stages.getStage(oldDeal.stageId);

  const { canEditMemberIds } = stage;

  if (
    canEditMemberIds &&
    canEditMemberIds.length > 0 &&
    !canEditMemberIds.includes(user._id)
  ) {
    throw new Error('Permission denied');
  }

  if (
    doc.status === 'archived' &&
    oldDeal.status === 'active' &&
    !(await canGroup(subdomain, 'dealsArchive', user))
  ) {
    throw new Error('Permission denied');
  }

  if (extendedDoc.propertiesData) {
    // clean custom field values
    extendedDoc.propertiesData = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: extendedDoc.propertiesData,
      defaultValue: {},
    });
  }

  const updatedItem = await models.Deals.updateDeal(_id, extendedDoc);
  // labels should be copied to newly moved pipeline
  if (updatedItem.stageId !== oldDeal.stageId) {
    await copyPipelineLabels(models, { item: oldDeal, doc, user });
  }

  // const notificationDoc: IBoardNotificationParams = {
  const notificationDoc: any = {
    item: updatedItem,
    user,
    type: `dealEdit`,
    contentType: 'deal',
  };

  if (doc.status && oldDeal.status && oldDeal.status !== doc.status) {
    const activityAction = doc.status === 'active' ? 'activated' : 'archived';

    // order notification
    await changeItemStatus(models, user, {
      item: updatedItem,
      oldDeal,
      status: activityAction,
      processId,
      stage,
    });
  }

  if (doc.assignedUserIds) {
    const { addedUserIds, removedUserIds } = checkUserIds(
      oldDeal.assignedUserIds,
      doc.assignedUserIds,
    );

    notificationDoc.invitedUsers = addedUserIds;
    notificationDoc.removedUsers = removedUserIds;
  }

  await sendNotifications(models, subdomain, notificationDoc);

  // exclude [null]
  if (doc.tagIds?.length) {
    doc.tagIds = doc.tagIds.filter((ti) => ti);
  }

  const transitionedToArchived =
    doc.status === 'archived' &&
    !!oldDeal.status &&
    oldDeal.status !== doc.status;

  if (!transitionedToArchived) {
    await subscriptionWrapper(models, {
      action: 'update',
      deal: updatedItem,
      oldDeal,
      pipelineId: stage.pipelineId,
    });
  }

  await doScoreCampaign(subdomain, models, _id, updatedItem);
  await confirmLoyalties(subdomain, _id, updatedItem);

  if (oldDeal.stageId === updatedItem.stageId) {
    return updatedItem;
  }

  await processStageChangeScoreCampaigns({
    subdomain,
    models,
    deal: updatedItem,
    newStageId: updatedItem.stageId,
    user,
  });

  // if task moves between stages
  await itemMover(models, user._id, oldDeal, updatedItem.stageId);

  return updatedItem;
};

const generateTotalAmount = (productsData: any[] = []) => {
  return productsData.reduce((sum, product: any) => {
    return sum + (product.amount || 0);
  }, 0);
};

const fixNum = (num: number, fractionDigits = 2) => {
  return Number((num || 0).toFixed(fractionDigits));
};

const getTRPCData = (result: any, defaultValue: any) => {
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data ?? defaultValue;
  }

  return result ?? defaultValue;
};

const createBonusProductDataId = (productId: string) => {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const checkLoyalties = async (
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

  const result = await sendTRPCMessage({
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

  const loyalties = getTRPCData(result, {});

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

const checkPricing = async (
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

  const result = await sendTRPCMessage({
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

  const pricing = getTRPCData(result, {});
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
    (bonusProductId) => ({
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

const confirmLoyalties = async (
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

const subtractScoreCampaign = async ({
  subdomain,
  paymentType,
  deal,
  customerId,
  target,
  targetId,
}: {
  subdomain: string;
  paymentType?: any;
  deal: IDeal;
  customerId: string;
  target: any;
  targetId: string;
}) => {
  const scoreCampaignId = paymentType?.scoreCampaignId;

  if (!scoreCampaignId) {
    return;
  }

  const scoreCampaign = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    module: 'score',
    action: 'scoreCampaign',
    input: { _id: scoreCampaignId },
    defaultValue: null,
  });

  if (!scoreCampaign?.data) {
    return;
  }

  const { additionalConfig = {} } = scoreCampaign.data || {};
  const stageIds =
    additionalConfig?.cardBasedRule?.flatMap(({ stageIds }) => stageIds) || [];

  if (!stageIds.includes(deal.stageId)) {
    return;
  }

  const result = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'score',
    action: 'doScoreCampaign',
    input: {
      ownerType: 'customer',
      ownerId: customerId,
      campaignId: scoreCampaignId,
      target,
      actionMethod: 'subtract',
      serviceName: 'sales',
      targetId,
    },
    defaultValue: null,
  });

  if (!result) {
    return;
  }
};

const refundScoreCampaign = async ({
  subdomain,
  targetId,
  customerId,
  pipeline,
  checkInId,
}: {
  subdomain: string;
  targetId: string;
  customerId: string;
  pipeline: any;
  checkInId: string;
}) => {
  await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'score',
    action: 'refundLoyaltyScore',
    input: {
      targetId,
      ownerType: 'customer',
      ownerId: customerId,
      scoreCampaignIds: (pipeline?.paymentTypes || [])
        .map(({ scoreCampaignId }) => scoreCampaignId)
        .filter(Boolean),
      checkInId,
    },
    defaultValue: null,
  });
};

const doScoreCampaign = async (
  subdomain: string,
  models: IModels,
  _id: string,
  deal: IDeal,
) => {
  if (!deal?.paymentsData) {
    return;
  }

  const stage = await models.Stages.findOne({ _id: deal.stageId });

  const pipeline = await models.Pipelines.findOne({
    _id: stage?.pipelineId,
    'paymentTypes.scoreCampaignId': { $exists: true },
  });

  const [customerId] = (await getCustomerIds(subdomain, _id)) || [];

  if (!pipeline || !customerId) {
    return;
  }

  const scoreCampaignTypes = (pipeline?.paymentTypes || []).filter(
    ({ scoreCampaignId }) => !!scoreCampaignId,
  );

  const target: any = {
    paymentsData: Object.entries(deal.paymentsData).map(([type, obj]) => ({
      type,
      ...obj,
    })),
    totalAmount: generateTotalAmount(deal.productsData || []),
  };

  target.excludeAmount = Object.entries(deal.paymentsData)
    .filter(
      ([type]) => !scoreCampaignTypes.map(({ type }) => type).includes(type),
    )
    .map(([type, obj]) => ({
      type,
      ...obj,
    }))
    .reduce((sum, payment: any) => sum + (payment?.amount || 0), 0);

  for (const type of Object.keys(deal.paymentsData)) {
    const paymentType = scoreCampaignTypes.find(
      (scoreCampaignType) => scoreCampaignType.type === type,
    );

    await subtractScoreCampaign({
      subdomain,
      paymentType,
      deal,
      customerId,
      target,
      targetId: _id,
    });
  }

  await refundScoreCampaign({
    subdomain,
    targetId: _id,
    customerId,
    pipeline,
    checkInId: deal.stageId,
  });
};
