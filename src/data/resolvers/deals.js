import {
  Products,
  Companies,
  Customers,
  Users,
  DealStages,
  DealPipelines,
  DealBoards,
} from '../../db/models';

export default {
  companies(deal) {
    return Companies.find({ _id: { $in: deal.companyIds || [] } });
  },

  customers(deal) {
    return Customers.find({ _id: { $in: deal.customerIds || [] } });
  },

  async products(deal) {
    const products = [];

    for (const data of deal.productsData || []) {
      const product = await Products.findOne({ _id: data.productId });

      // Add product object to resulting list
      if (data && product) {
        products.push({
          ...data.toJSON(),
          product: product.toJSON(),
        });
      }
    }

    return products;
  },

  amount(deal) {
    const data = deal.productsData || [];
    const amountsMap = {};

    data.forEach(product => {
      const type = product.currency;

      if (type) {
        if (!amountsMap[type]) amountsMap[type] = 0;

        amountsMap[type] += product.amount || 0;
      }
    });

    return amountsMap;
  },

  assignedUsers(deal) {
    return Users.find({ _id: { $in: deal.assignedUserIds } });
  },

  async pipeline(deal) {
    const stage = await DealStages.findOne({ _id: deal.stageId });

    return DealPipelines.findOne({ _id: stage.pipelineId });
  },

  async boardId(deal) {
    const stage = await DealStages.findOne({ _id: deal.stageId });

    const pipeline = await DealPipelines.findOne({ _id: stage.pipelineId });

    const board = await DealBoards.findOne({ _id: pipeline.boardId });

    return board._id;
  },
};
