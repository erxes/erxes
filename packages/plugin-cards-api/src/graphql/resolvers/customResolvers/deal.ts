import { PipelineLabels, Pipelines, Stages } from '../../../models';
import { IDealDocument } from '../../../models/definitions/deals';
import { IContext } from '@erxes/api-utils/src';
import { boardId } from '../../utils';
import { Fields } from '../../../apiCollections';
import {
  findProducts,
  sendConformityMessage,
  sendContactRPCMessage,
  sendNotificationRPCMessage
} from '../../../messageBroker';
import { getDocument, getDocumentList } from '../../../cacheUtils';

export const generateProducts = async productsData => {
  const products: any = [];

  for (const data of productsData || []) {
    if (!data.productId) {
      continue;
    }

    const product = await findProducts('findOne', { _id: data.productId });

    const { customFieldsData } = product;

    const customFields: any[] = [];

    for (const customFieldData of customFieldsData || []) {
      const field = await Fields.findOne({ _id: customFieldData.field }).lean();

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
    const companyIds = await sendConformityMessage('savedConformity', {
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['company']
    });

    return sendContactRPCMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    });
  },

  async customers(deal: IDealDocument) {
    const customerIds = await sendConformityMessage('savedConformity', {
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['customer']
    });

    return sendContactRPCMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    });
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

    return Pipelines.findOne({ _id: stage.pipelineId }).lean();
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
    return false;
    return sendNotificationRPCMessage('checkIfRead', {
      userId: user._id,
      itemId: deal._id
    });
  },

  labels(deal: IDealDocument) {
    return PipelineLabels.find({ _id: { $in: deal.labelIds || [] } }).lean();
  },

  createdUser(deal: IDealDocument) {
    return getDocument('users', { _id: deal.userId });
  }
};
