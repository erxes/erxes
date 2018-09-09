import { Companies, Customers, DealBoards, DealPipelines, DealStages, Products, Users } from '../../db/models';
import { IDealDocument } from '../../db/models/definitions/deals';

export default {
  companies(deal: IDealDocument) {
    return Companies.find({ _id: { $in: deal.companyIds || [] } });
  },

  customers(deal: IDealDocument) {
    return Customers.find({ _id: { $in: deal.customerIds || [] } });
  },

  async products(deal: IDealDocument) {
    const products: any = [];

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

  amount(deal: IDealDocument) {
    const data = deal.productsData || [];
    const amountsMap = {};

    data.forEach(product => {
      const type = product.currency;

      if (type) {
        if (!amountsMap[type]) {
          amountsMap[type] = 0;
        }

        amountsMap[type] += product.amount || 0;
      }
    });

    return amountsMap;
  },

  assignedUsers(deal: IDealDocument) {
    return Users.find({ _id: { $in: deal.assignedUserIds } });
  },

  async pipeline(deal: IDealDocument) {
    const stage = await DealStages.findOne({ _id: deal.stageId });

    if (!stage) {
      throw new Error('Stage not found');
    }

    return DealPipelines.findOne({ _id: stage.pipelineId });
  },

  async boardId(deal: IDealDocument) {
    const stage = await DealStages.findOne({ _id: deal.stageId });

    if (!stage) {
      throw new Error('Stage not found');
    }

    const pipeline = await DealPipelines.findOne({ _id: stage.pipelineId });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const board = await DealBoards.findOne({ _id: pipeline.boardId });

    if (!board) {
      throw new Error('Board not found');
    }

    return board._id;
  },
};
