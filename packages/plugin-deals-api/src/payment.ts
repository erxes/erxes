import { generateModels } from './connectionResolver';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { status, contentType, contentTypeId, amount, _id, currency } = data;

    if (contentType !== 'cards:deals' || status !== 'paid') {
      return;
    }

    const deal = await models.Deals.getDeal(contentTypeId);
    const oldPaymentsData = deal.paymentsData || {};
    const bankData = oldPaymentsData.bank || { info: {} };
    const oldInfo = (bankData.info?.invoices || []).find((i) => i._id === _id);

    const newAmount = (bankData.amount || 0) - (oldInfo?.amount || 0) + amount;
    bankData.amount = (newAmount <= 0 && 0) || newAmount;
    bankData.currency = currency || 'MNT';
    bankData.info.invoices = [
      ...(bankData.info?.invoices || []).filter((i) => i._id !== _id),
      {
        _id,
        amount,
      },
    ];

    await models.Deals.updateOne(
      { _id: contentTypeId },
      {
        $set: {
          paymentsData: {
            ...oldPaymentsData,
            bank: bankData,
          },
        },
      },
    );
  },
};
