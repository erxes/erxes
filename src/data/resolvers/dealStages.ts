import { Deals } from '../../db/models';
import { IStageDocument } from '../../db/models/definitions/deals';

export default {
  async amount(stage: IStageDocument) {
    const deals = await Deals.find({ stageId: stage._id });
    const amountsMap = {};

    deals.forEach(deal => {
      const data = deal.productsData || [];

      data.forEach(product => {
        const type = product.currency;

        if (type) {
          if (!amountsMap[type]) {
            amountsMap[type] = 0;
          }

          amountsMap[type] += product.amount || 0;
        }
      });
    });

    return amountsMap;
  },
};
