import { Deals } from '../../db/models';

export default {
  async amount(stage) {
    const deals = await Deals.find({ stageId: stage._id });
    const amountObj = {};

    deals.forEach(deal => {
      const data = deal.productsData || [];

      data.forEach(product => {
        const type = product.currency;

        if (!amountObj[type]) amountObj[type] = 0;

        amountObj[type] += product.amount || 0;
      });
    });

    return amountObj;
  },
};
