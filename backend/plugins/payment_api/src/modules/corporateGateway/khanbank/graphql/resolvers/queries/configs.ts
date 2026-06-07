import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { checkPermission, requireLogin } from 'erxes-api-shared/core-modules';

const queries = {
  async khanbankConfigsList(
    _root,
    { limit, cursor }: { limit?: number; cursor?: string },
    { models }: IContext,
  ) {
    const result = await cursorPaginate({
      model: models.KhanbankConfigs,
      query: {},
      params: {
        limit: limit || 20,
        cursor,
        orderBy: { createdAt: -1 },
      },
    });

    return {
      list: result.list.map((config) => config.toJSON()),
      totalCount: result.totalCount,
      pageInfo: result.pageInfo,
    };
  },

  async khanbankConfigs(
    _root,
    { limit, cursor }: { limit?: number; cursor?: string },
    { models }: IContext,
  ) {
    const result = await cursorPaginate({
      model: models.KhanbankConfigs,
      query: {},
      params: {
        limit: limit || 20,
        cursor,
        orderBy: { createdAt: -1 },
      },
    });

    return result.list.map((config) => config.toJSON());
  },

  async khanbankConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const config = await models.KhanbankConfigs.getConfig({ _id });
    return config.toJSON();
  },
};

export default queries;
