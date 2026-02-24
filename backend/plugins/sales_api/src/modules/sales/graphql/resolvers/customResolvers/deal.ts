import { IContext } from '~/connectionResolvers';
import { IDealDocument } from '~/modules/sales/@types';
import { generateAmounts } from '~/modules/sales/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ICompany, ICustomer } from 'erxes-api-shared/core-types';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Deals.findOne({ _id });
  },

  async customers(
    deal: IDealDocument & { customers: ICustomer[] },
    _args: undefined,
    { loaders }: IContext,
  ) {
    return await loaders.deal.customersByDealId.load(deal._id);
  },

  async companies(
    deal: IDealDocument & { companies: ICompany[] },
    _args: undefined,
    { loaders }: IContext,
  ) {
    return await loaders.deal.companiesByDealId.load(deal._id);
  },

  async branches(
    deal: IDealDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
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

  async customPropertiesData(
    deal: IDealDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    const customFieldsData = (deal?.customFieldsData as any[]) || [];

    const fieldIds = customFieldsData.map((customField) => customField.field);

    if (!fieldIds?.length) {
      return customFieldsData;
    }

    const fields = await sendTRPCMessage({
      subdomain,
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

  async pipeline(deal: IDealDocument, _args: undefined, { loaders }: IContext) {
    return await loaders.deal.pipelineByDealId.load(deal.stageId);
  },

  async boardId(deal: IDealDocument, _args: undefined, { loaders }: IContext) {
    const pipeline = await loaders.deal.pipelineByDealId.load(deal.stageId);
    return pipeline.boardId;
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

  async vendorCustomers(
    deal: IDealDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return await sendTRPCMessage({
      subdomain,

      pluginName: 'content',
      module: 'portal',
      action: 'portalUserCard',
      input: {
        contentType: 'deal',
        contentTypeId: deal.id,
      },
    });
  },
};
