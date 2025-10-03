import { IContext } from '~/connectionResolvers';
import { IDealDocument } from '~/modules/sales/@types';
import { generateAmounts } from '~/modules/sales/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Deals.findOne({ _id });
  },

  async customers(deal: IDealDocument) {
    const customerIds = await sendTRPCMessage({
      pluginName: 'core',
      module: 'conformity',
      action: 'savedConformity',
      input: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['customer']
      },
      defaultValue: []
    });

    if (!customerIds.length) {
      return [];
    }

    return customerIds.map((customerId) => ({
      __typename: 'Customer',
      _id: customerId,
    }));

  },

  async companies(deal: IDealDocument) {
    const customerIds = await sendTRPCMessage({
      pluginName: 'core',
      module: 'conformity',
      action: 'savedConformity',
      input: {
        mainType: 'deal',
        mainTypeId: deal._id,
        relTypes: ['company']
      },
      defaultValue: []
    });

    if (!customerIds.length) {
      return [];
    }

    return customerIds.map((customerId) => ({
      __typename: 'Customer',
      _id: customerId,
    }));

  },

  async branches(deal: IDealDocument) {
    if (!deal.branchIds?.length) {
      return [];
    }

    return deal.branchIds.map((branchId) => ({
      __typename: 'Branch',
      _id: branchId,
    }));
  },

  async departments(deal: IDealDocument) {
    if (!deal.departmentIds?.length) {
      return [];
    }

    return deal.departmentIds.map((departmentId) => ({
      __typename: 'Department',
      _id: departmentId,
    }));
  },

  async assignedUsers(deal: IDealDocument) {
    if (!deal.assignedUserIds?.length) {
      return [];
    }

    return deal.assignedUserIds.map((assignedUserId) => ({
      __typename: 'User',
      _id: assignedUserId,
    }));
  },

  async customPropertiesData(deal: IDealDocument) {
    const customFieldsData = (deal?.customFieldsData as any[]) || [];

    const fieldIds = customFieldsData.map((customField) => customField.field);

    if (!fieldIds?.length) {
      return customFieldsData;
    }

    const fields = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'find',
      input: {
        query: {
          _id: { $in: fieldIds },
        },
      },
      defaultValue: [],
    });

    for (const customFieldData of customFieldsData) {
      const field = fields.find((field) => field._id === customFieldData.field);
      if (field) {
        customFieldData.type = field.type;
      }
    }

    return customFieldsData;
  },
  createdUserId(deal: IDealDocument) {
    return deal?.userId ? deal.userId : null;
  },

  async tags(deal: IDealDocument) {
    return (deal.tagIds || [])
      .filter((_id) => !!_id)
      .map((_id) => ({ __typename: 'Tag', _id }));
  },

  // async products(deal: IDealDocument) {
  //   const { productsData } = deal || {};

  //   const products: any = [];

  //   if (!productsData || !productsData.length) {
  //     return products;
  //   }

  //   const productIds = productsData
  //     .filter((pd) => pd.productId)
  //     .map((pd) => pd.productId);

  //   const allProducts = await sendTRPCMessage({
  //     pluginName: 'core',
  //     method: 'query',
  //     module: 'products',
  //     action: 'find',
  //     input: {
  //       query: {
  //         _id: { $in: productIds },
  //       },
  //       limit: productsData.length,
  //     },
  //   });

  //   for (const data of productsData || []) {
  //     if (!data.productId) {
  //       continue;
  //     }
  //     const product = allProducts.find((p) => p._id === data.productId);

  //     if (!product) {
  //       continue;
  //     }

  //     const { customFieldsData } = product;

  //     const customFields: any[] = [];

  //     const fieldIds: string[] = [];
  //     for (const customFieldData of customFieldsData || []) {
  //       fieldIds.push(customFieldData.field);
  //     }

  //     const fields = await sendTRPCMessage({
  //       pluginName: 'core',
  //       method: 'query',
  //       module: 'fields',
  //       action: 'find',
  //       input: {
  //         query: {
  //           _id: { $in: fieldIds },
  //         },
  //       },
  //       defaultValue: [],
  //     });

  //     for (const customFieldData of customFieldsData || []) {
  //       const field = fields.find((f) => f._id === customFieldData.field);

  //       if (field) {
  //         customFields[customFieldData.field] = {
  //           text: field.text,
  //           data: customFieldData.value,
  //         };
  //       }
  //     }

  //     product.customFieldsData = customFields;

  //     products.push({
  //       ...data,
  //       product,
  //     });
  //   }

  //   return products;
  // },

  async products(deal: IDealDocument) {
    if (!deal.productsData) {
      return [];
    }

    return deal.productsData.map((pd) => ({
      __typename: 'Product',
      _id: pd.productId,
    }));
  },

  async unusedAmount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || [], false);
  },

  async amount(deal: IDealDocument) {
    return generateAmounts(deal.productsData || []);
  },

  async pipeline(deal: IDealDocument, _args: undefined, { models }: IContext) {
    const stage = await models.Stages.getStage(deal.stageId);

    return models.Pipelines.findOne({ _id: stage.pipelineId }).lean();
  },

  async boardId(deal: IDealDocument, _args: undefined, { models }: IContext) {
    const stage = await models.Stages.getStage(deal.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const board = await models.Boards.getBoard(pipeline.boardId);

    return board._id;
  },

  async stage(deal: IDealDocument, _args: undefined, { models }: IContext) {
    return models.Stages.getStage(deal.stageId);
  },

  async isWatched(deal: IDealDocument, _args: undefined, { user }: IContext) {
    const watchedUserIds = deal.watchedUserIds || [];

    if (watchedUserIds && watchedUserIds.includes(user._id)) {
      return true;
    }

    return false;
  },

  // async hasNotified(deal: IDealDocument, _args, { user }: IContext) {},

  async labels(deal: IDealDocument, _args: undefined, { models }: IContext) {
    return models.PipelineLabels.find({
      _id: { $in: deal.labelIds || [] },
    }).lean();
  },

  createdUser(deal: IDealDocument) {
    if (!deal.userId) {
      return;
    }

    return { __typename: 'User', _id: deal.userId };
  },

  async vendorCustomers(deal: IDealDocument) {
    return await sendTRPCMessage({
      pluginName: 'content',
      module: 'portal',
      action: 'portalUserCard',
      input: {
        contentType: 'deal',
        contentTypeId: deal.id
      }
    })
  }
};
