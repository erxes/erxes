import { IDealDocument } from '../../../models/definitions/deals';
import { boardId } from '../../utils';
import { IContext } from '../../../connectionResolver';
import { sendContactsMessage, sendCoreMessage, sendFormsMessage, sendNotificationsMessage, sendProductsMessage } from '../../../messageBroker';

export const generateProducts = async productsData => {
  const products: any = [];

  for (const data of productsData || []) {
    if (!data.productId) {
      continue;
    }

    const product = await sendProductsMessage('findOne', { _id: data.productId }, true);

    const { customFieldsData } = product;

    const customFields: any[] = [];

    for (const customFieldData of customFieldsData || []) {
      const field = await sendFormsMessage('fields:findOne', { _id: customFieldData.field }, true);

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
    const companyIds = await sendCoreMessage('savedConformity', {
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['company']
    }, true);

    const activeCompanies = await sendContactsMessage('findActiveCompanies', {
      selector: { _id: { $in: companyIds } }
    }, true, []);

    return (activeCompanies || []).map(c => ({ __typename: "Company", _id: c._id }));
  },

  async customers(deal: IDealDocument) {
    const customerIds = await sendCoreMessage('savedConformity', {
      mainType: 'deal',
      mainTypeId: deal._id,
      relTypes: ['customer']
    }, true, []);

    const activeCustomers = await sendContactsMessage('findActiveCustomers', {
      selector: { _id: { $in: customerIds } }
    }, true, []);

    return (activeCustomers || []).map(c => ({ __typename: "Customer", _id: c._id }));
  },

  async products(deal: IDealDocument) {
    return generateProducts(deal.productsData);
  },

  amount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || []);
  },

  assignedUsers(deal: IDealDocument) {
    return (deal.assignedUserIds || []).map( _id => ({ __typename: "User", _id }));
  },

  async pipeline(deal: IDealDocument, _args, { models }: IContext) {
    const stage = await models.Stages.getStage(deal.stageId);

    return models.Pipelines.findOne({ _id: stage.pipelineId }).lean();
  },

  boardId(deal: IDealDocument, _args, { models }: IContext) {
    return boardId(models, deal);
  },

  stage(deal: IDealDocument, _args, { models }: IContext) {
    return models.Stages.getStage(deal.stageId);
  },

  isWatched(deal: IDealDocument, _args, { user }: IContext) {
    const watchedUserIds = deal.watchedUserIds || [];

    if (watchedUserIds && watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  hasNotified(deal: IDealDocument, _args, { user }: IContext) {
    return sendNotificationsMessage('checkIfRead', {
      userId: user._id,
      itemId: deal._id
    }, true, true);
  },

  labels(deal: IDealDocument, _args, { models }: IContext) {
    return models.PipelineLabels.find({ _id: { $in: deal.labelIds || [] } }).lean();
  },

  createdUser(deal: IDealDocument) {
    return { __typename: "User", _id: deal.userId };
  }
};
