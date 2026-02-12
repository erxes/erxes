import { getEnv } from "@erxes/api-utils/src";
import { debugError } from "@erxes/api-utils/src/debuggers";
import { getOrganizations } from "@erxes/api-utils/src/saas/saas";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { ICustomField } from "@erxes/api-utils/src/types";
import { IModels } from "./connectionResolver";
import { collections } from "./constants";
import {
  sendClientPortalMessage,
  sendCommonMessage,
  sendCoreMessage,
} from "./messageBroker";
import { VOUCHER_STATUS } from "./models/definitions/constants";
import { SCORE_CAMPAIGN_STATUSES } from "./models/definitions/scoreCampaigns";

interface IProductD {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const availableVoucherTypes = ["bonus", "discount"];

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

export const getChildTags = async (subdomain: string, tagIds) => {
  const childs = await sendCoreMessage({
    subdomain,
    action: "tagWithChilds",
    data: {
      query: { _id: { $in: tagIds } },
    },
    isRPC: true,
    defaultValue: [],
  });

  const allTagIds: string[] = (childs || []).map((ch) => ch._id) || [];
  return Array.from(new Set(allTagIds));
};

export const applyRestriction = async ({
  subdomain,
  restrictions,
  products,
}: {
  subdomain: string;
  restrictions: Record<string, any>;
  products: IProductD[];
}) => {
  const {
    categoryIds = [],
    excludeCategoryIds = [],
    productIds = [],
    excludeProductIds = [],
    tagIds = [],
    excludeTagIds = [],
  } = restrictions || {};

  const inputProductsIds = products.map((p) => p.productId);

  const [includedCategoryIds, excludedCategoryIds] = await Promise.all([
    categoryIds.length ? getChildCategories(subdomain, categoryIds) : [],
    excludeCategoryIds.length
      ? getChildCategories(subdomain, excludeCategoryIds)
      : [],
  ]);

  const [includedTagIds, excludedTagIds] = await Promise.all([
    tagIds.length ? getChildTags(subdomain, tagIds) : [],
    excludeTagIds.length ? getChildTags(subdomain, excludeTagIds) : [],
  ]);

  const query: Record<string, any> = {
    _id: {
      $in: productIds.length ? productIds : inputProductsIds,
      $nin: excludeProductIds,
    },
  };

  if (includedCategoryIds.length || excludedCategoryIds.length) {
    query.categoryId = {
      ...(includedCategoryIds.length && { $in: includedCategoryIds }),
      ...(excludedCategoryIds.length && { $nin: excludedCategoryIds }),
    };
  }

  if (includedTagIds.length || excludedTagIds.length) {
    query.tagIds = {
      ...(includedTagIds.length && { $in: includedTagIds }),
      ...(excludedTagIds.length && { $nin: excludedTagIds }),
    };
  }

  const productDocs = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: { query },
    isRPC: true,
    defaultValue: [],
  });

  const productMap = new Map(products.map((p) => [p.productId, p]));

  const totalAmount = productDocs.reduce((sum, { _id }) => {
    const item = productMap.get(_id);
    return sum + (item ? item.quantity * item.unitPrice : 0);
  }, 0);

  return { productDocs, restrictedAmount: totalAmount };
};

export const directVoucher = async ({
  result,
  ownerType,
  ownerId,
  models,
  subdomain,
  products,
}) => {
  const NOW = new Date();
  const productsIds = products.map((p) => p.productId);

  const activeCampaignIds = await models.Vouchers.find({
    ownerType,
    ownerId,
    status: { $in: ["new"] },
  }).distinct("campaignId");

  for (const voucherType of availableVoucherTypes) {
    const campaign = await models.VoucherCampaigns.find({
      _id: { $in: activeCampaignIds },
      finishDateOfUse: { $gte: NOW },
      voucherType: { $in: [voucherType] },
    }).lean();

    const vouchers = await models.Vouchers.aggregate([
      {
        $match: {
          ownerType,
          ownerId,
          status: { $in: ["new"] },
          campaignId: { $in: campaign.map((c) => c._id) },
        },
      },
      {
        $lookup: {
          from: "voucher_campaigns",
          localField: "campaignId",
          foreignField: "_id",
          as: "campaign_doc",
        },
      },
      {
        $project: {
          campaignId: 1,
          createdAt: 1,
          modifiedAt: 1,
          usedAt: 1,
          userId: 1,

          ownerType: 1,
          ownerId: 1,
          campaign: { $arrayElemAt: ["$campaign_doc", 0] },
          bonusInfo: 1,
        },
      },
    ]);

    if (voucherType === "bonus") {
      for (const voucher of vouchers) {
        for (const productId of productsIds) {
          if (voucher.campaign.bonusProductId === productId) {
            result[productId].voucherCampaignId = voucher.campaignId;
            result[productId].voucherId = voucher._id;
            result[productId].potentialBonus +=
              voucher.campaign.bonusCount -
              (voucher.bonusInfo || []).reduce(
                (sum, i) => sum + i.usedCount,
                0
              );
            result[productId].type = voucherType;
            result[productId].discount = 100;
            result[productId].bonusName = voucher.campaign.title;
          }
        }
      }
    }

    if (voucherType === "discount") {
      for (const voucher of vouchers) {
        const { title, kind, value, restrictions } = voucher.campaign;

        const { productDocs, restrictedAmount } = await applyRestriction({
          subdomain,
          restrictions,
          products,
        });

        for (const product of productDocs) {
          const { _id } = product;

          const item = products.find((p) => p.productId === _id) || {};

          const discount = calculateDiscount({
            kind,
            value,
            product: {
              ...item,
              discount: result[_id]?.discount || 0,
            },
            totalAmount: restrictedAmount,
          });

          result[_id] = {
            ...result[_id],
            voucherCampaignId: voucher.campaignId,
            voucherId: voucher._id,
            discount,
            voucherName: title,
            type: voucherType,
            sumDiscount: result[_id]?.sumDiscount + discount,
          };
        }
      }
    }
  }
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

  if (ownerType === "customer") {
    const customerRelatedClientPortalUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        $or: [{ _id: ownerId }, { erxesCustomerId: ownerId }],
      },
      isRPC: true,
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = "cpUser";
    }
  }

  const totalAmount = products.reduce((sum, product) => {
    return sum + product.quantity * product.unitPrice;
  }, 0);

  for (const product of products) {
    const { productId } = product || {};

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

  await directVoucher({
    result,
    ownerType,
    ownerId,
    models,
    subdomain,
    products,
  });

  if (voucherId) {
    const voucherCampaign = await models.Vouchers.checkVoucher({
      voucherId,
      ownerType,
      ownerId,
    });

    const { title, kind, value, restrictions = {} } = voucherCampaign;

    const { productDocs, restrictedAmount } = await applyRestriction({
      subdomain,
      restrictions,
      products,
    });

    await models.Vouchers.checkVoucher({
      voucherId,
      ownerType,
      ownerId,
      totalAmount,
    });

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
          product: {
            ...item,
            discount: result[_id].discount || 0,
          },
          totalAmount: restrictedAmount,
        }),
        voucherName: title,
        type: "voucher",
      };
    }
  }

  // coupon
  if (couponCode) {
    const couponCampaign = await models.Coupons.checkCoupon({
      code: couponCode,
      ownerId,
    });

    const { title, kind, value, restrictions = {} } = couponCampaign;

    const { productDocs, restrictedAmount } = await applyRestriction({
      subdomain,
      restrictions,
      products,
    });

    await models.Coupons.checkCoupon({
      code: couponCode,
      ownerId,
      totalAmount,
    });

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
          product: {
            ...item,
            discount: result[_id].discount || 0,
          },
          totalAmount: restrictedAmount,
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
  subdomain: string,
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
    totalAmount?: string;
  }
) => {
  const { couponCode, voucherId, totalAmount, ...usageInfo } = extraInfo || {};

  if (extraInfo?.ownerType === "customer" && extraInfo?.ownerId) {
    const customerRelatedClientPortalUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        erxesCustomerId: extraInfo.ownerId,
      },
      isRPC: true,
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      usageInfo.ownerId = customerRelatedClientPortalUser._id;
      usageInfo.ownerType = "cpUser";
    }
  }

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

  let lastDescription = description;
  if (!lastDescription.startsWith('handle')) {
    lastDescription = `handle ${lastDescription}`
  }

  await models.ScoreLogs.changeScore({
    ownerId,
    ownerType,
    changeScore: scoreToChange,
    description: lastDescription,
  });

  return "success";
};

export const calculateDiscount = ({ kind, value, product, totalAmount }) => {
  try {
    if (kind === "percent") {
      if (product?.discount) {
        return Math.min(product.discount + value, 100);
      }

      return Math.min(value, 100);
    }

    if (!product || !totalAmount) {
      return 0;
    }

    const productPrice = product.unitPrice * (product.quantity || 1);

    if (productPrice <= 0) {
      return 0;
    }

    const productDiscount = (productPrice / totalAmount) * value;

    const discount = (productDiscount / productPrice) * 100;

    if (product?.discount) {
      return Math.min(discount + product.discount, 100);
    }

    return Math.min(discount, 100);
  } catch (error) {
    console.error("Error calculating discount:", error.message);
    return 0;
  }
};

export const handleLoyaltyReward = async ({ subdomain }) => {
  if (!isEnabled("automations")) return;

  const VERSION = getEnv({ name: "VERSION" });

  const NOW = new Date();
  const NOW_MONTH = NOW.getMonth() + 1;

  for (const collectionName of Object.keys(collections)) {
    const query = collections[collectionName](NOW_MONTH) || {};

    if (VERSION && VERSION === "saas") {
      const orgs = await getOrganizations();

      const enabledOrganizations = orgs.filter((org) => !org?.isDisabled);

      for (const org of enabledOrganizations) {
        const targets =
          (await sendCoreMessage({
            subdomain: org.subdomain,
            action: `${collectionName}.find`,
            data: query,
            isRPC: true,
            defaultValue: [],
          })) || [];

        if (targets.length === 0) return;

        sendCommonMessage({
          subdomain: org.subdomain,
          serviceName: "automations",
          action: "trigger",
          data: {
            type: "loyalties:reward",
            targets,
          },
          defaultValue: [],
          isRPC: true,
        });
      }
      continue;
    } else {
      const targets =
        (await sendCoreMessage({
          subdomain,
          action: `${collectionName}.find`,
          data: query,
          isRPC: true,
          defaultValue: [],
        })) || [];

      if (targets.length === 0) return;

      sendCommonMessage({
        subdomain,
        serviceName: "automations",
        action: "trigger",
        data: {
          type: "loyalties:reward",
          targets,
        },
        defaultValue: [],
        isRPC: true,
      });
    }
  }
};

export const doScoreCampaign = async (models: IModels, data) => {
  const { ownerType, ownerId, actionMethod, targetId } = data;

  try {
    await models.ScoreCampaigns.checkScoreAviableSubtract(data);

    const scoreLog =
      (await models.ScoreLogs.find({
        ownerId,
        ownerType,
        targetId,
        action: actionMethod,
      }).lean()) || [];

    if (scoreLog.length) {
      return;
    }

    return await models.ScoreCampaigns.doCampaign(data);
  } catch (error) {
    debugError(error);
    throw new Error(error.message);
  }
};

export const refundLoyaltyScore = async (
  models: IModels,
  { targetId, ownerType, ownerId, scoreCampaignIds, checkInId }
) => {
  if (!scoreCampaignIds.length) return;

  const scoreCampaigns =
    (await models.ScoreCampaigns.find({
      _id: { $in: scoreCampaignIds },
    }).lean()) || [];

  for (const scoreCampaign of scoreCampaigns) {
    const { additionalConfig } = scoreCampaign || {};

    const checkInIds =
      additionalConfig?.cardBasedRule?.flatMap(
        ({ refundStageIds }) => refundStageIds
      ) || [];

    if (checkInIds.includes(checkInId)) {
      try {
        await models.ScoreCampaigns.refundLoyaltyScore(
          targetId,
          ownerType,
          ownerId
        );
      } catch (error) {
        if (
          error.message ===
          "Cannot refund loyalty score cause already refunded loyalty score"
        ) {
          return;
        }
      }
    }
  }
};

export const handleLoyaltyOwnerChange = async (
  subdomain: string,
  models: IModels,
  ownerId: string,
  ownerIds: string[],
) => {
  await models.Vouchers.updateMany(
    { ownerId: { $in: ownerIds } },
    { $set: { ownerId } },
  );

  await models.Coupons.updateMany(
    { "usageLogs.ownerId": { $in: ownerIds } },
    { $set: { "usageLogs.$[elem].ownerId": ownerId } },
    { arrayFilters: [{ "elem.ownerId": { $in: ownerIds } }] },
  );

  await models.ScoreLogs.updateMany(
    { ownerId: { $in: ownerIds } },
    { $set: { ownerId } },
  );

  const customer = await sendCoreMessage({
    subdomain,
    action: "customers.findOne",
    data: {
      _id: ownerId,
    },
    isRPC: true,
    defaultValue: {},
  });

  const scoreCampaigns = await models.ScoreCampaigns.find({ status: SCORE_CAMPAIGN_STATUSES.PUBLISHED }).distinct("fieldId");

  const fieldIds = new Set(scoreCampaigns);

  const customFieldsData: ICustomField[] = [];
  const scoreFieldsData: Record<string, ICustomField> = {};

  for (const customFieldData of (customer?.customFieldsData || [])) {
    const { field, value, numberValue } = customFieldData || {};

    if (!fieldIds.has(field)) {
      customFieldsData.push(customFieldData);

      continue;
    }

    const numericValue = numberValue ?? Number(value) ?? 0;

    if (!scoreFieldsData[field]) {
      scoreFieldsData[field] = {
        field,
        value: 0,
        numberValue: 0,
        stringValue: "0",
      };
    }

    scoreFieldsData[field].value += numericValue;
    scoreFieldsData[field].numberValue += numericValue;
    scoreFieldsData[field].stringValue = String(scoreFieldsData[field].numberValue);
  }

  const preparedCustomFieldsData = await sendCoreMessage({
    subdomain,
    action: "fields.prepareCustomFieldsData",
    data: [...customFieldsData, ...(Object.values(scoreFieldsData) || [])],
    defaultValue: [],
    isRPC: true,
  });

  await models.ScoreCampaigns.updateOwnerScore({
    ownerId,
    ownerType: "customer",
    updatedCustomFieldsData: preparedCustomFieldsData,
  });
};
