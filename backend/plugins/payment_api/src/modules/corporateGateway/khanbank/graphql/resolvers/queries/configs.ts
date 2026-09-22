import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';

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
      list: result.list,
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

    return result.list;
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
