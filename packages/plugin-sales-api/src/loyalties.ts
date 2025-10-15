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

const getCustomerFields = async (subdomain) => {
  const customerFields = await sendCoreMessage({
    subdomain,
    action: "fields.fieldsCombinedByContentType",
    data: { contentType: "core:customer" },
    isRPC: true,
    defaultValue: [],
  });

  return customerFields.map((field) => ({
    label: `Customer ${field.label}`,
    value: `customer-${field.name}`,
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

  const excludedAmount = excludedProducts.reduce((acc, excludedProduct) => {
    const amount = Number(excludedProduct?.amount) || 0;
    let quantity = Number(excludedProduct?.quantity) || 1;

    if (excludedProduct?.discount) {
      quantity = 1;
    }

    return acc + amount * quantity;
  }, 0);

  return { target, excludedProductsAmount: excludedAmount };
};

const generateCustomerData = async (
  subdomain: string,
  campaign: any,
  actionMethod: "add" | "subtract",
  target: { _id: string } & IDeal
) => {
  const methodConfig = campaign[actionMethod] || {};

  const placeholder = methodConfig?.placeholder;

  const attributes = placeholder.match(/\{\{\s*([^}]+)\s*\}\}/g);

  const attributesValues = attributes.map((attribute) =>
    attribute.replace(/\{\{\s*|\s*\}\}/g, "")
  );
  if (attributesValues.some((value) => value.includes("customer-"))) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "deal",
        mainTypeId: target?._id,
        relTypes: ["customer"],
      },
      isRPC: true,
      defaultValue: [],
    });

    if (customerIds.length) {
      const customer = await sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: { _id: { $in: customerIds } },
        isRPC: true,
        defaultValue: [],
      });
      return customer;
    }
  }
};
export const extendLoyaltyTarget = async (
  models: IModels,
  target: { _id: string } & IDeal,
  campaign = {},
  actionMethod: "add" | "subtract",
  subdomain: string
) => {
  const { target: updatedTarget, excludedProductsAmount } =
    await applyProductRestrictions({ target, campaign, subdomain });

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
    const adjusted = excludeAmount - excludedProductsAmount;

    if (adjusted < 0 && !updatedTarget?.productsData?.length) {
      excludeAmount = 0;
    } else {
      excludeAmount = Math.max(0, adjusted);
    }
  }

  const customer = await generateCustomerData(
    subdomain,
    campaign,
    actionMethod,
    target
  );
  return { totalAmount, excludeAmount, ...updatedTarget, customer };
};

export default {
  name: "sales",
  label: "Sales pipeline",
  icon: "piggy-bank",
  isAviableAdditionalConfig: true,
  extendTargetAutomation: true,
  targetExtender: async ({
    subdomain,
    data: { target, campaignId, actionMethod },
  }) => {
    const models = await generateModels(subdomain);

    const scoreCampaign = await sendLoyaltiesMessage({
      subdomain,
      action: "scoreCampaign.findOne",
      data: { _id: campaignId },
      isRPC: true,
      defaultValue: {},
    });

    return await extendLoyaltyTarget(
      models,
      target,
      scoreCampaign,
      actionMethod,
      subdomain
    );
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
      ...(await getCustomerFields(subdomain)),
    ];
  },
};
