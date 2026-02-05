import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IProductD } from './common';

const availableVoucherTypes = ['bonus', 'discount'];

export const calculateDiscount = ({ kind, value, product, totalAmount }) => {
  try {
    if (kind === 'percent') {
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
    console.error('Error calculating discount:', error.message);
    return 0;
  }
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'categories',
    action: 'withChilds',
    input: {
      ids: categoryIds,
    },
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];

  return Array.from(new Set(catIds));
};

export const getChildTags = async (subdomain: string, tagIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'withChilds',
    input: {
      query: { _id: { $in: tagIds } },
    },
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

  const productDocs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: { query },
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
    status: { $in: ['new'] },
  }).distinct('campaignId');

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
          status: { $in: ['new'] },
          campaignId: { $in: campaign.map((c) => c._id) },
        },
      },
      {
        $lookup: {
          from: 'voucher_campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign_doc',
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
          campaign: { $arrayElemAt: ['$campaign_doc', 0] },
          bonusInfo: 1,
        },
      },
    ]);

    if (voucherType === 'bonus') {
      for (const voucher of vouchers) {
        for (const productId of productsIds) {
          if (voucher.campaign.bonusProductId === productId) {
            result[productId].voucherCampaignId = voucher.campaignId;
            result[productId].voucherId = voucher._id;
            result[productId].potentialBonus +=
              voucher.campaign.bonusCount -
              (voucher.bonusInfo || []).reduce(
                (sum, i) => sum + i.usedCount,
                0,
              );
            result[productId].type = voucherType;
            result[productId].discount = 100;
            result[productId].bonusName = voucher.campaign.title;
          }
        }
      }
    }

    if (voucherType === 'discount') {
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
  discountInfo?: Record<string, string>,
) => {
  const result = {};

  const { couponCode, voucherId } = discountInfo || {};

  if (!ownerId && !ownerId && !products) {
    return 'No Data';
  }

  if (ownerType === 'customer') {
    const customerRelatedClientPortalUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'clientPortalUsers',
      action: 'findOne',
      input: {
        $or: [{ _id: ownerId }, { erxesCustomerId: ownerId }],
      },
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = 'cpUser';
    }
  }

  const totalAmount = products.reduce((sum, product) => {
    return sum + product.quantity * product.unitPrice;
  }, 0);

  for (const product of products) {
    const { productId } = product || {};

    if (!Object.keys(result).includes(productId)) {
      result[productId] = {
        voucherCampaignId: '',
        voucherId: '',
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
        type: 'voucher',
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
        type: 'coupon',
      };
    }
  }

  return result;
};
