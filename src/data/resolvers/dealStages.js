import { Deals } from '../../db/models';

export default {
  async amount(stage) {
    const deals = await Deals.find({ stageId: stage._id });
    let amount = 0;

    deals.forEach(deal => {
      const data = deal.productsData || [];
      data.forEach(product => {
        amount += product.amount || 0;
      });
    });

    return amount;
  },
};
