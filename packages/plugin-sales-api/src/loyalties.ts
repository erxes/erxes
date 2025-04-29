import { generateModels, IModels } from "./connectionResolver";
import { generateTotalAmount } from "./graphql/resolvers/mutations/utils";
import { IDeal } from "./models/definitions/deals";

const getPaymentsAttributes = async (subdomain) => {
  const models = await generateModels(subdomain);

  const paymentTypes = await models.Pipelines.find({}).distinct("paymentTypes");

  return paymentTypes.map(({ type, title }) => ({
    label: `Sales payment type ${title} amount`,
    value: `paymentsData-${type}-amount`,
  }));
};

export const extendLoyaltyTarget = async (models: IModels, target: IDeal) => {
  console.log({target})
  const totalAmount = generateTotalAmount(target.productsData);

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

  const payments = Object.entries(target?.paymentsData || {});

  const validPayments = payments
    .filter(([type, obj]) => hasValidAmount(type, obj))
    .map(([type, obj]) => ({
      type,
      ...obj,
    }));

  const excludeAmount =
    validPayments.reduce((sum, payment) => sum + (payment?.amount || 0), 0) ||
    0;

    console.log({ totalAmount, excludeAmount, ...target })

  return { totalAmount, excludeAmount, ...target };
};

export default {
  name: "sales",
  label: "Sales pipeline",
  icon: "piggy-bank",
  isAviableAdditionalConfig: true,
  extendTargetAutomation: true,
  targetExtender: async ({ subdomain, data: { target, campaignId } }) => {
    const models = await generateModels(subdomain);

    return await extendLoyaltyTarget(models, target);
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
