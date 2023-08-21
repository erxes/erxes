import { IDealDocument } from '../../../models/definitions/deals';
import { boardId } from '../../utils';
import { IContext } from '../../../connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage,
  sendNotificationsMessage,
  sendProductsMessage
} from '../../../messageBroker';

export const generateProducts = async (
  subdomain: string,
  productsData?: any[]
) => {
  const products: any = [];

  if (!productsData || !productsData.length) {
    return products;
  }

  const productIds = productsData
    .filter(pd => pd.productId)
    .map(pd => pd.productId);

  const allProducts = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productIds } }, limit: productsData.length },
    isRPC: true,
    defaultValue: []
  });

  for (const data of productsData || []) {
    if (!data.productId) {
      continue;
    }
    const product = allProducts.find(p => p._id === data.productId);

    if (!product) {
      continue;
    }

    const { customFieldsData } = product;

    const customFields: any[] = [];

    const fieldIds: string[] = [];
    for (const customFieldData of customFieldsData || []) {
      fieldIds.push(customFieldData.field);
    }

    const fields = await sendFormsMessage({
      subdomain,
      action: 'fields.find',
      data: {
        query: {
          _id: { $in: fieldIds }
        }
      },
      isRPC: true
    });

    for (const customFieldData of customFieldsData || []) {
      const field = fields.find(f => f._id === customFieldData.field);

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

export const generateAmounts = (productsData, useTick = true) => {
  const amountsMap = {};

  (productsData || []).forEach(product => {
    // Tick paid or used is false then exclude
    if (useTick && !product.tickUsed) {
      return;
    }

    if (!useTick && product.tickUsed) {
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
  __resolveReference({ _id }, { models }: IContext) {
    return models.Deals.findOne({ _id });
  },

  async companies(
    deal: IDealDocument,
    _args,
    { subdomain }: IContext,
    { isSubscription }
  ) {
    const companyIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['company']
      },
      isRPC: true,
      defaultValue: []
    });

    const activeCompanies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: { selector: { _id: { $in: companyIds } } },
      isRPC: true,
      defaultValue: []
    });

    if (isSubscription) {
      return activeCompanies;
    }

    return (activeCompanies || []).map(c => ({
      __typename: 'Company',
      _id: c._id
    }));
  },

  async customers(
    deal: IDealDocument,
    _args,
    { subdomain }: IContext,
    { isSubscription }
  ) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['customer']
      },
      isRPC: true,
      defaultValue: []
    });

    const activeCustomers = await sendContactsMessage({
      subdomain,
      action: 'customers.findActiveCustomers',
      data: { selector: { _id: { $in: customerIds } } },
      isRPC: true,
      defaultValue: []
    });

    if (isSubscription) {
      return activeCustomers;
    }

    return (activeCustomers || []).map(c => ({
      __typename: 'Customer',
      _id: c._id
    }));
  },

  async products(deal: IDealDocument, _args, { subdomain }: IContext) {
    const response = await generateProducts(subdomain, deal.productsData);

    return response;
  },

  unUsedAmount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || [], false);
  },

  amount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || []);
  },

  assignedUsers(
    deal: IDealDocument,
    _args,
    { subdomain }: IContext,
    { isSubscription }
  ) {
    if (isSubscription && deal.assignedUserIds?.length) {
      return sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            _id: { $in: deal.assignedUserIds }
          }
        },
        isRPC: true
      });
    }

    return (deal.assignedUserIds || [])
      .filter(e => e)
      .map(_id => ({
        __typename: 'User',
        _id
      }));
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

  async hasNotified(deal: IDealDocument, _args, { user, subdomain }: IContext) {
    const response = await sendNotificationsMessage({
      subdomain,
      action: 'checkIfRead',
      data: {
        userId: user._id,
        itemId: deal._id
      }
    });

    return response;
  },

  labels(deal: IDealDocument, _args, { models }: IContext) {
    return models.PipelineLabels.find({
      _id: { $in: deal.labelIds || [] }
    }).lean();
  },

  async tags(deal: IDealDocument) {
    return (deal.tagIds || []).map(_id => ({ __typename: 'Tag', _id }));
  },

  createdUser(deal: IDealDocument) {
    if (!deal.userId) {
      return;
    }

    return { __typename: 'User', _id: deal.userId };
  }
};
