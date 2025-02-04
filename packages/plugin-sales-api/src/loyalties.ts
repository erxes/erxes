import { generateModels } from './connectionResolver';

const getPaymentsAttributes = async (subdomain) => {
  const models = await generateModels(subdomain);

  const paymentTypes = await models.Pipelines.find({
  }).distinct('paymentTypes');

  return paymentTypes.map(({ type, title }) => ({
    label: `Sales payment type ${title} amount`,
    value: `paymentsData-${type}-amount`
  }));
};

export default {
  getScoreCampaingAttributes: async ({ subdomain }) => {
    return [
      { label: 'Sales Total Amount', value: 'totalAmount' },
      { label: 'Sales Cash Amount', value: 'paymentsData-cash-amount' },
      { label: 'Exclude Sales Amount from campaign amount', value: 'excludeAmount' },
      ...(await getPaymentsAttributes(subdomain))
    ];
  }
};
