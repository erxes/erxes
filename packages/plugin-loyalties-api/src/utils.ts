import { IModels } from './connectionResolver';
import { sendProductsMessage, sendSegmentsMessage } from './messageBroker';
import { VOUCHER_STATUS } from './models/definitions/constants';

interface IProductD {
  productId: string;
  quantity: number;
}

const getChildCategories = async (subdomain: string, categoryIds) => {
  let catIds: string[] = [];
  for (const categoryId of categoryIds) {
    if (catIds.includes(categoryId)) {
      continue;
    }

    const childs = await sendProductsMessage({
      subdomain,
      action: 'categories.withChilds',
      data: { _id: categoryId },
      isRPC: true,
      defaultValue: []
    });

    catIds = catIds.concat((childs || []).map(ch => ch._id) || []);
  }

  return Array.from(new Set(catIds));
};

export const checkVouchersSale = async (
  models: IModels,
  subdomain: string,
  ownerType: string,
  ownerId: string,
  products: IProductD[]
) => {
  const result = {};

  if (!ownerId && !ownerId && !products) {
    return 'No Data';
  }

  const now = new Date();
  const productsIds = products.map(p => p.productId);

  for (const productId of productsIds) {
    if (!Object.keys(result).includes(productId)) {
      result[productId] = {
        voucherCampaignId: '',
        voucherId: '',
        potentialBonus: 0,
        discount: 0,
        sumDiscount: 0
      };
    }
  }

  const voucherProject = {
    campaignId: 1,
    createdAt: 1,
    modifiedAt: 1,
    usedAt: 1,
    userId: 1,

    ownerType: 1,
    ownerId: 1,
    campaign: { $arrayElemAt: ['$campaign_doc', 0] }
  };
  const lookup = {
    from: 'voucher_campaigns',
    localField: 'campaignId',
    foreignField: '_id',
    as: 'campaign_doc'
  };

  const voucherFilter = { ownerType, ownerId, status: { $in: ['new'] } };

  const activeVouchers = await models.Vouchers.find(voucherFilter).lean();

  const activeCampaignIds = activeVouchers.map(v => v.campaignId);

  const campaignFilter = {
    _id: { $in: activeCampaignIds },
    finishDateOfUse: { $gte: now }
  };

  // bonus
  const bonusCampaign = await models.VoucherCampaigns.find({
    ...campaignFilter,
    voucherType: { $in: ['bonus'] }
  }).lean();

  const bonusVouchers = await models.Vouchers.aggregate([
    {
      $match: {
        ...voucherFilter,
        campaignId: { $in: bonusCampaign.map(c => c._id) }
      }
    },
    {
      $lookup: lookup
    },
    {
      $project: {
        ...voucherProject,
        bonusInfo: 1
      }
    }
  ]);

  for (const bonusVoucher of bonusVouchers) {
    for (const productId of productsIds) {
      if (bonusVoucher.campaign.bonusProductId === productId) {
        result[productId].voucherCampaignId = bonusVoucher.campaignId;
        result[productId].voucherId = bonusVoucher._id;
        result[productId].potentialBonus +=
          bonusVoucher.campaign.bonusCount -
          (bonusVoucher.bonusInfo || []).reduce(
            (sum, i) => sum + i.usedCount,
            0
          );
        result[productId].type = 'bonus';
        result[productId].discount = 100;
        result[productId].bonusName = bonusVoucher.campaign.title;
      }
    }
  }

  // discount
  const discountCampaigns = await models.VoucherCampaigns.find({
    ...campaignFilter,
    voucherType: { $in: ['discount'] }
  }).lean();

  const discountVouchers = await models.Vouchers.aggregate([
    {
      $match: {
        ...voucherFilter,
        campaignId: { $in: discountCampaigns.map(c => c._id) }
      }
    },
    {
      $lookup: lookup
    },
    {
      $project: {
        ...voucherProject
      }
    }
  ]);

  const productCatIds = discountCampaigns.reduce(
    (catIds, c) => catIds.concat(c.productCategoryIds),
    []
  );

  const categoryIdsByCampaignId = {};
  let allCatIds: string[] = [];
  for (const campaign of discountCampaigns) {
    if (Object.keys(categoryIdsByCampaignId).includes(campaign._id)) {
      categoryIdsByCampaignId[campaign._id] = [];
    }
    const catIds = await getChildCategories(subdomain, [
      ...new Set(productCatIds)
    ]);
    categoryIdsByCampaignId[campaign._id] = catIds;
    allCatIds = allCatIds.concat(catIds);
  }

  const limit = await sendProductsMessage({
    subdomain,
    action: 'count',
    data: {
      query: { categoryId: { $in: allCatIds } }
    },
    isRPC: true,
    defaultValue: 0
  });

  const catProducts = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: { categoryId: { $in: allCatIds } },
      sort: { _id: 1, categoryId: 1 },
      limit
    },
    isRPC: true,
    defaultValue: []
  });

  const productIdsByCatId = {};
  for (const pr of catProducts) {
    if (!Object.keys(productIdsByCatId).includes(pr.categoryId)) {
      productIdsByCatId[pr.categoryId] = [];
    }

    productIdsByCatId[pr.categoryId].push(pr._id);
  }

  for (const discountVoucher of discountVouchers) {
    const catIds = categoryIdsByCampaignId[discountVoucher.campaignId];
    let productIds = discountVoucher.campaign.productIds || [];

    for (const catId of catIds) {
      productIds = productIds.concat(productIdsByCatId[catId] || []);
    }

    for (const productId of productsIds) {
      if (productIds.includes(productId)) {
        if (
          result[productId].discount < discountVoucher.campaign.discountPercent
        ) {
          result[productId] = {
            ...result[productId],
            voucherCampaignId: discountVoucher.campaignId,
            voucherId: discountVoucher._id,
            discount: discountVoucher.campaign.discountPercent,
            voucherName: discountVoucher.campaign.title,
            type: 'discount'
          };
        }
        result[productId].sumDiscount +=
          discountVoucher.campaign.discountPercent;
      }
    }
  }

  return result;
};

export const confirmVoucherSale = async (
  models: IModels,
  checkInfo: {
    [productId: string]: {
      voucherId: string;
      count: number;
    };
  }
) => {
  for (const productId of Object.keys(checkInfo)) {
    const rule = checkInfo[productId];

    if (!rule.voucherId) {
      continue;
    }

    if (rule.count) {
      const voucher = await models.Vouchers.findOne({
        _id: rule.voucherId
      }).lean();
      if (!voucher) {
        continue;
      }

      const campaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId
      });
      if (!campaign) {
        continue;
      }

      const oldBonusCount = (voucher.bonusInfo || []).reduce(
        (sum, i) => sum + i.usedCount,
        0
      );

      const updateInfo: any = {
        $push: { bonusInfo: { usedCount: rule.count } }
      };
      if (campaign.bonusCount - oldBonusCount <= rule.count) {
        updateInfo.$set = { status: VOUCHER_STATUS.LOSS };
      }

      await models.Vouchers.updateOne({ _id: rule.voucherId }, updateInfo);
    }
  }
};

export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string
) => {
  const response = await sendSegmentsMessage({
    subdomain,
    action: 'isInSegment',
    data: { segmentId, idToCheck: targetId },
    isRPC: true
  });

  return response;
};

export interface AssignmentCheckResponse {
  segmentId: string;
  isIn: boolean;
}
