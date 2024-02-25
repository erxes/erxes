import { paginate } from '@erxes/api-utils/src';
import { IContext, IModels } from '../../../connectionResolver';

const generateFilters = async (params: any, models: IModels) => {
  let filter: any = {};

  if (params.searchValue) {
    const searchValue = { $regex: new RegExp(params.searchValue, 'i') };

    filter = {
      ...filter,
      $or: [
        { name: searchValue },
        { subdomain: searchValue },
        { appToken: searchValue },
      ],
    };
  }

  if (!!params?.dateFilters?.length) {
    for (const { name, from, to } of params.dateFilters) {
      if (from) {
        filter[name] = { $gte: new Date(from) };
      }
      if (to) {
        filter[name] = { ...filter[name], $lte: new Date(to) };
      }
    }
  }

  if (params?.customerId) {
    const syncIds = await models.SyncedContacts.find({
      contactType: 'customer',
      contactTypeId: params?.customerId,
    }).distinct('syncId');

    filter._id = { $in: syncIds };
  }

  if (params?.customerIds) {
    const syncIds = await models.SyncedContacts.find({
      contactType: 'customer',
      contactTypeId: { $in: params?.customerIds },
    }).distinct('syncId');

    filter._id = { $in: syncIds };
  }

  if (params?.excludeCustomerIds) {
    const syncIds = await models.SyncedContacts.find({
      contactType: 'customer',
      contactTypeId: { $in: params?.excludeCustomerIds },
    }).distinct('syncId');

    filter._id = { $nin: syncIds };
  }

  if (params?.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (
    (params?.customerId || params?.customerIds?.length) &&
    params.status &&
    filter?._id?.$in
  ) {
    let customerIds: string[] = [];

    if (params.customerId) customerIds.push(params.customerId);

    if (!!params?.customerIds?.length)
      customerIds = [...customerIds, params.customerIds];

    const syncIds = await models.SyncedContacts.find({
      contactType: 'customer',
      contactTypeId: { $in: customerIds },
      status: params.status,
    }).distinct('syncId');

    filter._id = { $in: syncIds };
  }

  return filter;
};

const syncQueries = {
  async syncedSaasList(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params, models);

    return paginate(models.Sync.find(filter), params);
  },
  async syncedSaasListTotalCount(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params, models);

    return await models.Sync.countDocuments(filter);
  },
  async SyncedSaasDetail(_root, { _id }, { models }: IContext) {
    const sync = await models.Sync.findOne({ _id });
    if (!sync) {
      throw new Error('Not found');
    }
    return sync;
  },
  async getSyncedSaas(_root, args, { models }: IContext) {
    return await models.Sync.getSyncedSaas(args);
  },
  async searchContactFromSaas(
    _root,
    { syncId, email, contactType },
    { models }: IContext,
  ) {
    if (!syncId || !email || !contactType) {
      throw new Error('Please provide a sync ID or email address');
    }

    return await models.Sync.searchContactFromSaas(syncId, email, contactType);
  },
};

export default syncQueries;
