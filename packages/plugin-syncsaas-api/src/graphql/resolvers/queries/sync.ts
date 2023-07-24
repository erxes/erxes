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
        { appToken: searchValue }
      ]
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
    const syncIds = await models.SyncedCustomers.find({
      customerId: params?.customerId
    }).distinct('syncId');

    filter._id = { $in: syncIds };
  }

  if (params?.customerIds) {
    const syncIds = await models.SyncedCustomers.find({
      customerId: { $in: params?.customerIds }
    }).distinct('syncId');

    filter._id = { $in: syncIds };
  }

  if (params?.excludedCustomerIds) {
    const syncIds = await models.SyncedCustomers.find({
      customerId: { $nin: params?.excludedCustomerIds }
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
  async getSyncedSaas(_root, args, { models, subdomain }: IContext) {
    return await models.Sync.getSyncedSaas(args, subdomain);
  }
};

export default syncQueries;
