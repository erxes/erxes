import { checkPermission, paginate, requireLogin } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  async khanbankConfigsList(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const totalCount = await models.KhanbankConfigs.find({}).countDocuments();

    const query = paginate(
      models.KhanbankConfigs.find({}).sort({ createdAt: -1 }),
      { page: page || 1, perPage: perPage || 20 }
    );

    const configs = await query;
    const list = await configs.map((config) => config.toJSON());

    return {
      list,
      totalCount,
    };
  },

  async khanbankConfigs(
    _root,
    { page, perPage }: { page: number; perPage: number },
    { models }: IContext
  ) {
    const query = paginate(
      models.KhanbankConfigs.find({}).sort({ createdAt: -1 }),
      { page: page || 1, perPage: perPage || 20 }
    );

    // Execute the query to get the Mongoose documents
    const configs = await query;

    // Apply `toJSON()` transformation manually for each document
    return configs.map((config) => config.toJSON());
  },

  async khanbankConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return (await models.KhanbankConfigs.getConfig({ _id })).toJSON();
  },
};

requireLogin(queries, 'khanbankConfigs');
requireLogin(queries, 'khanbankConfigsList');
requireLogin(queries, 'khanbankConfigsDetail');

checkPermission(queries, 'khanbankConfigs', 'khanbankConfigsShow', []);
checkPermission(queries, 'khanbankConfigsList', 'khanbankConfigsShow', []);
checkPermission(queries, 'khanbankConfigsDetail', 'khanbankConfigsShow', []);

export default queries;
