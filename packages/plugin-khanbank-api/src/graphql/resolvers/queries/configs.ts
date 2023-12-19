import { checkPermission, paginate, requireLogin } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  async khanbankConfigsList(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const totalCount = await models.KhanbankConfigs.find({}).count();

    return {
      list: paginate(
        models.KhanbankConfigs.find({})
          .sort({ createdAt: -1 })
          .lean(),
        {
          page: page || 1,
          perPage: perPage || 20
        }
      ),
      totalCount
    };
  },

  async khanbankConfigs(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const response = await models.KhanbankConfigs.find({}).sort({
      createdAt: -1
    });

    return paginate(response, { page: page || 1, perPage: perPage || 20 });
  },

  async khanbankConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.KhanbankConfigs.getConfig({ _id });
  }
};

requireLogin(queries, 'khanbankConfigs');
requireLogin(queries, 'khanbankConfigsList');
requireLogin(queries, 'khanbankConfigsDetail');

checkPermission(queries, 'khanbankConfigs', 'khanbankConfigsShow', []);
checkPermission(queries, 'khanbankConfigsList', 'khanbankConfigsShow', []);
checkPermission(queries, 'khanbankConfigsDetail', 'khanbankConfigsShow', []);

export default queries;
