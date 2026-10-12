import dayjs from 'dayjs';
import {
  IScoreCampaign,
  IScoreCampaignDocument,
} from '@/score/@types/scoreCampaign';
import { IModels } from '~/connectionResolvers';

export const scoreActiveUsers = async ({ models }) => {
  const currentMonthStart = dayjs().subtract(1, 'month').toDate();
  const currentMonthEnd = dayjs().toDate();

  const monthlyActiveUsersPipeline = [
    {
      $match: {
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: '$ownerId',
      },
    },
    {
      $count: 'count',
    },
  ];

  const [monthlyActiveUsers] = await models.ScoreLogs.aggregate(
    monthlyActiveUsersPipeline,
  );

  const totalActiveUsersPipeline = [
    {
      $group: {
        _id: '$ownerId',
      },
    },
    {
      $count: 'count',
    },
  ];

  const [totalActiveUsers] = await models.ScoreLogs.aggregate(
    totalActiveUsersPipeline,
  );

  return {
    monthlyActiveUsers: monthlyActiveUsers?.count || 0,
    totalActiveUsers: totalActiveUsers?.count || 0,
  };
};

export const scorePoint = async ({ models, filter }) => {
  const refundedTargetIds = await models.ScoreLogs.distinct('targetId', {
    action: { $in: ['refund', 'return'] },
  });

  const totalPointEarned = {
    $sum: {
      $cond: {
        if: { $eq: ['$action', 'add'] },
        then: '$changeScore',
        else: 0,
      },
    },
  };

  const totalPointRedeemed = {
    $sum: {
      $cond: {
        if: { $eq: ['$action', 'subtract'] },
        then: { $abs: '$changeScore' },
        else: 0,
      },
    },
  };

  const pointPipeline = [
    {
      $match: {
        ...filter,
        targetId: {
          $nin: refundedTargetIds,
          ...filter.targetId,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPointEarned: totalPointEarned,
        totalPointRedeemed: totalPointRedeemed,
      },
    },
    {
      $project: {
        totalPointEarned: 1,
        totalPointRedeemed: 1,
        totalPointBalance: {
          $subtract: ['$totalPointEarned', '$totalPointRedeemed'],
        },
      },
    },
  ];

  const [points] = await models.ScoreLogs.aggregate(pointPipeline);

  return {
    totalPointEarned: points?.totalPointEarned || 0,
    totalPointRedeemed: points?.totalPointRedeemed || 0,
    totalPointBalance: points?.totalPointBalance || 0,
  };
};

export const scoreProducts = async ({ models, filter }) => {
  const [mostRedeemedProductCategory] = await models.ScoreLogs.aggregate([
    {
      $match: {
        ...filter,
        targetId: {
          ...filter.targetId,
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: 'deals',
        localField: 'targetId',
        foreignField: '_id',
        as: 'dealTarget',
      },
    },
    {
      $unwind: {
        path: '$dealTarget',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$dealTarget.productsData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'pos_orders',
        localField: 'targetId',
        foreignField: '_id',
        as: 'orderTarget',
      },
    },
    {
      $unwind: {
        path: '$orderTarget',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$orderTarget.items',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        productId: {
          $ifNull: [
            '$orderTarget.items.productId',
            '$dealTarget.productsData.productId',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$productId',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'product_categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'productCategory',
      },
    },
    { $unwind: '$productCategory' },
    {
      $group: {
        _id: '$productCategory._id',
        name: { $first: '$productCategory.name' },
        totalCount: { $sum: '$count' },
      },
    },
    {
      $sort: { totalCount: -1 },
    },
    { $limit: 1 },
  ]);

  return {
    mostRedeemedProductCategory: mostRedeemedProductCategory?.name || '',
  };
};

export const scoreStatistic = async ({ models, filter }) => {
  const { monthlyActiveUsers, totalActiveUsers } = await scoreActiveUsers({
    models,
  });

  const { totalPointEarned, totalPointRedeemed, totalPointBalance } =
    await scorePoint({
      models,
      filter,
    });

  const { mostRedeemedProductCategory } = await scoreProducts({
    models,
    filter,
  });

  const redemptionRate = totalPointEarned
    ? (totalPointRedeemed / totalPointEarned) * 100
    : 0;

  return {
    totalPointEarned,
    totalPointRedeemed,
    totalPointBalance,
    mostRedeemedProductCategory,
    redemptionRate,
    activeLoyaltyMembers: totalActiveUsers,
    monthlyActiveUsers,
  };
};

// A campaign writes to one account type; the account type decides the owner type.
// Campaigns from before account types keep writing the default score until
// they are migrated; no new campaign may do so.
export const bindCampaignAccountType = async ({
  models,
  doc,
  campaign,
}: {
  models: IModels;
  doc: IScoreCampaign;
  campaign?: IScoreCampaignDocument;
}) => {
  const bound: IScoreCampaign = { ...doc };

  // The balance field and owner type come from the account type only.
  delete bound.fieldId;
  delete bound.ownerType;

  // An omitted accountTypeId (partial update) keeps the current account type.
  const accountTypeId =
    bound.accountTypeId === undefined
      ? campaign?.accountTypeId
      : bound.accountTypeId;

  if (campaign && (campaign.accountTypeId || '') !== (accountTypeId || '')) {
    if (await models.ScoreLogs.exists({ campaignId: campaign._id })) {
      throw new Error(
        'This campaign already has score history; create a new campaign for another account type',
      );
    }
  }

  if (!accountTypeId) {
    if (campaign && !campaign.accountTypeId) {
      return bound;
    }

    throw new Error('Wallet is required');
  }

  // Only binding to an account type needs it active; campaigns already on an
  // archived account type stay editable.
  const accountType =
    accountTypeId === campaign?.accountTypeId
      ? await models.LoyaltyAccountTypes.getAccountType(accountTypeId)
      : await models.LoyaltyAccountTypes.getActiveAccountType(accountTypeId);

  return {
    ...bound,
    accountTypeId,
    ownerType: accountType.ownerType,
    fieldId: accountType.fieldId,
  };
};
