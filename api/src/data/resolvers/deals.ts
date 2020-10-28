import {
  Companies,
  Conformities,
  Customers,
  Fields,
  Notifications,
  PipelineLabels,
  Pipelines,
  Products,
  Stages,
  Users
} from '../../db/models';
import { IDealDocument } from '../../db/models/definitions/deals';
import { IContext } from '../types';
import { boardId } from './boardUtils';

export default {
  async companies(deal: IDealDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['company']
    });

    return Companies.find({ _id: { $in: companyIds } });
  },

  async customers(deal: IDealDocument) {
    const customerIds = await Conformities.savedConformity({
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['customer']
    });

    return Customers.find({ _id: { $in: customerIds } });
  },

  async products(deal: IDealDocument) {
    const products: any = [];

    for (const data of deal.productsData || []) {
      if (!data.productId) {
        continue;
      }

      const product = await Products.getProduct({ _id: data.productId });

      const { customFieldsData } = product;

      const customFields = [];

      for (const customFieldData of customFieldsData || []) {
        const field = await Fields.findOne({ _id: customFieldData.field });

        if (field) {
          customFields[customFieldData.field] = {
            text: field.text,
            data: customFieldData.value
          };
        }
      }

      product.customFieldsData = customFields;

      products.push({
        ...(typeof data.toJSON === 'function' ? data.toJSON() : data),
        product
      });
    }

    return products;
  },

  amount(deal: IDealDocument) {
    const productsData = deal.productsData || [];
    const amountsMap = {};

    productsData.forEach(product => {
      // Tick paid or used is false then exclude
      if (!product.tickUsed) {
        return;
      }

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
    return Users.find({ _id: { $in: deal.assignedUserIds || [] } });
  },

  async pipeline(deal: IDealDocument) {
    const stage = await Stages.getStage(deal.stageId);

    return Pipelines.findOne({ _id: stage.pipelineId });
  },

  boardId(deal: IDealDocument) {
    return boardId(deal);
  },

  stage(deal: IDealDocument) {
    return Stages.getStage(deal.stageId);
  },

  isWatched(deal: IDealDocument, _args, { user }: IContext) {
    const watchedUserIds = deal.watchedUserIds || [];

    if (watchedUserIds && watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(deal: IDealDocument, _args, { user }: IContext) {
    return Notifications.checkIfRead(user._id, deal._id);
  },

  labels(deal: IDealDocument) {
    return PipelineLabels.find({ _id: { $in: deal.labelIds || [] } });
  },

  createdUser(deal: IDealDocument) {
    return Users.findOne({ _id: deal.userId });
  }
};
