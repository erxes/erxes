import {
  Companies,
  Conformities,
  Customers,
  Fields,
  Notifications,
  PipelineLabels,
  Pipelines,
  Products,
  Stages
} from '../../db/models';
import { IDealDocument } from '../../db/models/definitions/deals';
import { IContext } from '../types';
import { boardId } from './boardUtils';
import { getDocument, getDocumentList } from './mutations/cacheUtils';

export const generateProducts = async productsData => {
  const products: any = [];

  for (const data of productsData || []) {
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
};

export const generateAmounts = productsData => {
  const amountsMap = {};

  (productsData || []).forEach(product => {
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
};

export default {
  async companies(deal: IDealDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['company']
    });

    return Companies.findActiveCompanies({ _id: { $in: companyIds } });
  },

  async customers(deal: IDealDocument) {
    const customerIds = await Conformities.savedConformity({
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['customer']
    });

    return Customers.findActiveCustomers({ _id: { $in: customerIds } });
  },

  async products(deal: IDealDocument) {
    return generateProducts(deal.productsData);
  },

  amount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || []);
  },

  assignedUsers(deal: IDealDocument) {
    return getDocumentList('users', {
      _id: { $in: deal.assignedUserIds || [] }
    });
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
    return getDocument('users', { _id: deal.userId });
  }
};
