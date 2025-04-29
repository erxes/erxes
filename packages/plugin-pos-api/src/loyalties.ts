import { generateModels } from "./connectionResolver";

const getPaymentsAttributes = async (subdomain) => {
  const models = await generateModels(subdomain);

  const paymentTypes = await models.Pos.find({}).distinct("paymentTypes");

  return paymentTypes.map(({ type, title }) => ({
    label: `Pos Order ${title} amount`,
    value: `paidAmounts-${type}-amount`,
  }));
};

export default {
  name: "pos",
  label: "POS Order",
  icon: "invoice",
  getScoreCampaingAttributes: async ({ subdomain }) => {
    return [
      { label: "Pos Order Total Amount", value: "totalAmount" },
      ...(await getPaymentsAttributes(subdomain)),
    ];
  },
};
