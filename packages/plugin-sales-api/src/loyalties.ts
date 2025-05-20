import { generateModels, IModels } from "./connectionResolver";
import { generateTotalAmount } from "./graphql/resolvers/mutations/utils";
import { sendCoreMessage, sendLoyaltiesMessage } from "./messageBroker";
import { IDeal } from "./models/definitions/deals";

const getPaymentsAttributes = async (subdomain) => {
  const models = await generateModels(subdomain);

  const paymentTypes = await models.Pipelines.find({}).distinct("paymentTypes");

  return paymentTypes.map(({ type, title }) => ({
    label: `Sales payment type ${title} amount`,
    value: `paymentsData-${type}-amount`,
  }));
};

const applyProductRestrictions = async ({ target, campaign, subdomain }) => {
  if (!campaign?.restrictions || !target?.productsData)
    return { target, excludedProductsAmount: 0 };

  const {
    categoryIds = [],
    excludeCategoryIds = [],
    productIds = [],
    excludeProductIds = [],
    tagIds = [],
    excludeTagIds = [],
  } = campaign.restrictions || {};

  const { discountCheck } = campaign.additionalConfig || {};

  const productIdsFromTarget = target.productsData.map((p) => p.productId);

  const query: any = {
    _id: {
      $in: [...productIdsFromTarget, ...productIds],
      $nin: excludeProductIds,
    },
  };

  if (categoryIds.length || excludeCategoryIds.length) {
    query.categoryId = {
      ...(categoryIds.length && { $in: categoryIds }),
      ...(excludeCategoryIds.length && { $nin: excludeCategoryIds }),
    };
  }

  if (tagIds.length || excludeTagIds.length) {
    query.tagIds = {
      ...(tagIds.length && { $in: tagIds }),
      ...(excludeTagIds.length && { $nin: excludeTagIds }),
    };
  }

  const productDocs = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: { query },
    isRPC: true,
    defaultValue: [],
  });

  const allowedProductIds = new Set(productDocs.map((p) => p._id));

  const originalProducts = target.productsData;

  const includedProducts: any = [];
  const excludedProducts: any = [];

  for (const product of originalProducts) {
    const isAllowed =
      allowedProductIds.has(product.productId) &&
      (!discountCheck || !product.discountPercent || !product.discount);

    if (isAllowed) {
      includedProducts.push(product);
    } else {
      excludedProducts.push(product);
    }
  }

  target.productsData = includedProducts;

  const excludedAmount = excludedProducts.reduce(
    (acc, excludedProduct) =>
      acc + (excludedProduct?.amount || 0) * (excludedProduct?.quantity || 1),
    0
  );

  console.log({ excludedAmount });

  return { target, excludedProductsAmount: excludedAmount };
};

export const extendLoyaltyTarget = async (
  models: IModels,
  target: IDeal,
  campaign,
  subdomain: string
) => {
  console.log("target 1", JSON.stringify(target, null, 2));
  const { target: updatedTarget, excludedProductsAmount } =
    await applyProductRestrictions({ target, campaign, subdomain });
  console.log("target 2", JSON.stringify(target, null, 2));

  const totalAmount = generateTotalAmount(updatedTarget.productsData);

  const paymentTypes = await models.Pipelines.find({
    "paymentTypes.scoreCampaignId": { $exists: true },
  }).distinct("paymentTypes");

  const scoreCampaignTypes = (paymentTypes || [])
    .filter(({ scoreCampaignId }) => !!scoreCampaignId)
    .map(({ type }) => type);

  const hasValidAmount = (type: string, obj: any) => {
    if (obj && obj.amount > 0 && !scoreCampaignTypes.includes(type)) {
      return true;
    }

    return false;
  };

  const payments = Object.entries((updatedTarget as IDeal)?.paymentsData || {});

  const validPayments = payments
    .filter(([type, obj]) => hasValidAmount(type, obj))
    .map(([type, obj]) => ({
      type,
      ...obj,
    }));

  let excludeAmount =
    validPayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0) ||
    0;

  if (excludeAmount && excludedProductsAmount) {
    excludeAmount = excludeAmount - excludedProductsAmount;
  }

  console.log({ totalAmount, excludeAmount, ...updatedTarget });

  return { totalAmount, excludeAmount, ...updatedTarget };
};

export default {
  name: "sales",
  label: "Sales pipeline",
  icon: "piggy-bank",
  isAviableAdditionalConfig: true,
  extendTargetAutomation: true,
  targetExtender: async ({ subdomain, data: { target, campaignId } }) => {
    const models = await generateModels(subdomain);

    const scoreCampaign = await sendLoyaltiesMessage({
      subdomain,
      action: "scoreCampaign.findOne",
      data: { _id: campaignId },
      isRPC: true,
      defaultValue: {},
    });

    return await extendLoyaltyTarget(models, target, scoreCampaign, subdomain);
  },
  getScoreCampaingAttributes: async ({ subdomain }) => {
    return [
      { label: "Sales Total Amount", value: "totalAmount" },
      { label: "Sales Cash Amount", value: "paymentsData-cash-amount" },
      {
        label: "Exclude Sales Amount from campaign amount",
        value: "excludeAmount",
      },
      ...(await getPaymentsAttributes(subdomain)),
    ];
  },
};
