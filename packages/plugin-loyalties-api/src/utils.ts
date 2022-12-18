import { IModels } from './connectionResolver';
import { sendProductsMessage, sendSegmentsMessage } from './messageBroker';
import { VOUCHER_STATUS } from './models/definitions/constants';

interface IProductD {
  productId: string;
  quantity: number;
}
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
  const discountCampaign = await models.VoucherCampaigns.find({
    ...campaignFilter,
    voucherType: { $in: ['discount'] }
  }).lean();

  const discountVouchers = await models.Vouchers.aggregate([
    {
      $match: {
        ...voucherFilter,
        campaignId: { $in: discountCampaign.map(c => c._id) }
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

  const productCatIds = discountCampaign.reduce(
    (catIds, c) => catIds.concat(c.productCategoryIds),
    []
  );

  const catProducts = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: { categoryId: { $in: [...new Set(productCatIds)] } },
      sort: { _id: 1, categoryId: 1 }
    },
    isRPC: true,
    defaultValue: []
  });

  const productIdByCatId = {};
  for (const pr of catProducts) {
    if (!Object.keys(productIdByCatId).includes(pr.categoryId)) {
      productIdByCatId[pr.categoryId] = [];
    }

    productIdByCatId[pr.categoryId].push(pr._id);
  }

  for (const discountVoucher of discountVouchers) {
    const catIds = discountVoucher.campaign.productCategoryIds;
    let productIds = discountVoucher.campaign.productIds || [];

    for (const catId of catIds) {
      productIds = productIds.concat(productIdByCatId[catId] || []);
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
