import { IModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";
import { VOUCHER_STATUS } from "./models/definitions/constants";

interface IProductD {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendCoreMessage({
    subdomain,
    action: "categories.withChilds",
    data: { ids: categoryIds },
    isRPC: true,
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(catIds));
};

export const checkVouchersSale = async (
  models: IModels,
  subdomain: string,
  ownerType: string,
  ownerId: string,
  products: IProductD[],
  discountInfo?: Record<string, string>
) => {
  const result = {};

  const { couponCode, voucherId } = discountInfo || {};

  if (!ownerId && !ownerId && !products) {
    return "No Data";
  }

  const now = new Date();
  const productsIds = products.map((p) => p.productId);

  for (const productId of productsIds) {
    if (!Object.keys(result).includes(productId)) {
      result[productId] = {
        voucherCampaignId: "",
        voucherId: "",
        potentialBonus: 0,
        discount: 0,
        sumDiscount: 0,
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
    campaign: { $arrayElemAt: ["$campaign_doc", 0] },
  };
  const lookup = {
    from: "voucher_campaigns",
    localField: "campaignId",
    foreignField: "_id",
    as: "campaign_doc",
  };

  const voucherFilter = { ownerType, ownerId, status: { $in: ["new"] } };

  const activeVouchers = await models.Vouchers.find(voucherFilter).lean();

  const activeCampaignIds = activeVouchers.map((v) => v.campaignId);

  const campaignFilter = {
    _id: { $in: activeCampaignIds },
    finishDateOfUse: { $gte: now },
  };

  // bonus
  const bonusCampaign = await models.VoucherCampaigns.find({
    ...campaignFilter,
    voucherType: { $in: ["bonus"] },
  }).lean();

  const bonusVouchers = await models.Vouchers.aggregate([
    {
      $match: {
        ...voucherFilter,
        campaignId: { $in: bonusCampaign.map((c) => c._id) },
      },
    },
    {
      $lookup: lookup,
    },
    {
      $project: {
        ...voucherProject,
        bonusInfo: 1,
      },
    },
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
        result[productId].type = "bonus";
        result[productId].discount = 100;
        result[productId].bonusName = bonusVoucher.campaign.title;
      }
    }
  }

  // discount
  const discountCampaigns = await models.VoucherCampaigns.find({
    ...campaignFilter,
    voucherType: { $in: ["discount"] },
  }).lean();

  const discountVouchers = await models.Vouchers.aggregate([
    {
      $match: {
        ...voucherFilter,
        campaignId: { $in: discountCampaigns.map((c) => c._id) },
      },
    },
    {
      $lookup: lookup,
    },
    {
      $project: {
        ...voucherProject,
      },
    },
  ]);

  const productCatIds = discountCampaigns.reduce(
    (catIds, c) => catIds.concat(c.productCategoryIds),
    [] as string[]
  );

  const categoryIdsByCampaignId = {};
  let allCatIds: string[] = [];
  for (const campaign of discountCampaigns) {
    if (Object.keys(categoryIdsByCampaignId).includes(campaign._id)) {
      categoryIdsByCampaignId[campaign._id] = [];
    }
    const catIds = await getChildCategories(subdomain, [
      ...new Set(productCatIds),
    ]);
    categoryIdsByCampaignId[campaign._id] = catIds;
    allCatIds = allCatIds.concat(catIds);
  }

  const catProducts = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: {
      query: { categoryId: { $in: allCatIds } },
      sort: { _id: 1, categoryId: 1 },
    },
    isRPC: true,
    defaultValue: [],
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
            type: "discount",
          };
        }
        result[productId].sumDiscount +=
          discountVoucher.campaign.discountPercent;
      }
    }
  }

  if (voucherId) {
    const voucherCampaign = await models.Vouchers.checkVoucher({
      voucherId,
      ownerType,
      ownerId,
    });

    const { title, kind, value } = voucherCampaign;

    const productDocs = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: {
          _id: {
            $in: [...productsIds],
          },
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    const totalAmount = productDocs.reduce((sum, doc) => {
      const { _id } = doc;

      const item: IProductD =
        products.find((p) => p.productId === _id) || ({} as IProductD);
      sum += item.quantity * item.unitPrice;

      return sum;
    }, 0);

    for (const product of productDocs) {
      const { _id } = product;

      const item = products.find((p) => p.productId === _id) || {};

      result[_id] = {
        ...result[_id],
        voucherCampaignId: voucherCampaign._id,
        voucherId: voucherId,
        discount: calculateDiscount({
          kind,
          value,
          product: item,
          totalAmount,
        }),
        voucherName: title,
        type: "reward",
      };
    }
  }

  // coupon
  if (couponCode) {
    const campaignId = await models.Coupons.checkCoupon({
      code: couponCode,
      ownerId,
    });

    if (!campaignId) {
      return result;
    }

    const couponCampaign: any = await models.CouponCampaigns.findOne({
      _id: campaignId,
    }).lean();

    if (!couponCampaign) {
      throw new Error("Coupon campaign not found");
    }

    const { title, kind, value, restrictions } = couponCampaign;

    const {
      minimumSpend = 0,
      categoryIds = [],
      excludeCategoryIds = [],
      productIds = [],
      excludeProductIds = [],
      tagIds = [],
      excludeTagIds = [],
    } = restrictions || {};

    const productDocs = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: {
          _id: {
            $in: [...productsIds, ...productIds],
            $nin: excludeProductIds,
          },
          categoryId: {
            ...(categoryIds.length ? { $in: categoryIds } : {}),
            $nin: excludeCategoryIds,
          },
          tagIds: {
            ...(tagIds.length ? { $in: tagIds } : {}),
            $nin: excludeTagIds,
          },
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    const totalAmount = productDocs.reduce((sum, doc) => {
      const { _id } = doc;

      const item: IProductD =
        products.find((p) => p.productId === _id) || ({} as IProductD);
      sum += item.quantity * item.unitPrice;

      return sum;
    }, 0);

    if (minimumSpend && totalAmount < minimumSpend) {
      throw new Error(
        `This coupon requires a minimum spend of ${minimumSpend}`
      );
    }

    for (const product of productDocs) {
      const { _id } = product;

      const item = products.find((p) => p.productId === _id) || {};

      result[_id] = {
        ...result[_id],
        couponCampaignId: couponCampaign._id,
        coupon: couponCode,
        discount: calculateDiscount({
          kind,
          value,
          product: item,
          totalAmount,
        }),
        couponName: title,
        type: "coupon",
      };
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
  },
  extraInfo?: {
    couponCode?: string;
    voucherId?: string;
    ownerType?: string;
    ownerId?: string;
    targetid?: string;
    serviceName?: string;
  }
) => {
  const { couponCode, voucherId, ...usageInfo } = extraInfo || {};

  if (couponCode) {
    await models.Coupons.redeemCoupon({
      code: couponCode,
      usageInfo,
    });
  }

  if (voucherId) {
    await models.Vouchers.redeemVoucher({
      voucherId,
      usageInfo,
    });
  }

  for (const productId of Object.keys(checkInfo)) {
    const rule = checkInfo[productId];

    if (!rule.voucherId) {
      continue;
    }

    if (rule.count) {
      const voucher = await models.Vouchers.findOne({
        _id: rule.voucherId,
      }).lean();
      if (!voucher) {
        continue;
      }

      const campaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId,
      });
      if (!campaign) {
        continue;
      }

      const oldBonusCount = (voucher.bonusInfo || []).reduce(
        (sum, i) => sum + i.usedCount,
        0
      );

      const updateInfo: any = {
        $push: { bonusInfo: { usedCount: rule.count } },
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
  const response = await sendCoreMessage({
    subdomain,
    action: "isInSegment",
    data: { segmentId, idToCheck: targetId },
    isRPC: true,
  });

  return response;
};

export interface AssignmentCheckResponse {
  segmentId: string;
  isIn: boolean;
}

export const generateAttributes = (value) => {
  const matches = (value || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
  return matches.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, ""));
};

export const handleScore = async (models: IModels, data) => {
  const { action, ownerId, ownerType, campaignId, target, description } = data;

  const scoreCampaign = await models.ScoreCampaigns.findOne({
    _id: campaignId,
  });

  if (!scoreCampaign) {
    throw new Error("Not found");
  }

  if (scoreCampaign.ownerType !== ownerType) {
    throw new Error("Missmatching owner type");
  }

  const config = scoreCampaign[action as "add" | "subtract"];

  const placeholer = config.placeholder;

  const attributes = generateAttributes(config.placeholder);

  if (attributes.length) {
    for (const attribute of attributes) {
      placeholer.replace(`{{ ${attribute} }}`, target[attribute]);
    }
  }

  const scoreToChange = eval(placeholer) / Number(config.currencyRatio);

  await models.ScoreLogs.changeScore({
    ownerId,
    ownerType,
    changeScore: scoreToChange,
    description,
  });

  return "success";
};

export const calculateDiscount = ({ kind, value, product, totalAmount }) => {
  try {
    if (kind === "percent") {
      return value;
    }

    if (!product || !totalAmount) {
      return 0;
    }

    const productPrice = product.unitPrice * product.quantity;

    const productDiscount = (productPrice / totalAmount) * value;

    if (productPrice <= 0) {
      return 0;
    }

    return (productDiscount / productPrice) * 100;
  } catch (error) {
    console.error("Error calculating discount:", error.message);
    return 0;
  }
};
