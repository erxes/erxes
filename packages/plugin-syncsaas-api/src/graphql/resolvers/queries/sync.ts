import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilters = async (params: any) => {
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

  return filter;
};

const syncQueries = {
  async syncedSaasList(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params);

    return paginate(models.Sync.find(filter), params);
  },
  async syncedSaasListTotalCount(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params);

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
