import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';

const queries = {
  async tdbConfigsList(
    _root,
    { limit, cursor }: { limit?: number; cursor?: string },
    { models }: IContext,
  ) {
    const result = await cursorPaginate({
      model: models.TdbConfigs,
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

  async tdbConfigs(
    _root,
    { limit, cursor }: { limit?: number; cursor?: string },
    { models }: IContext,
  ) {
    const result = await cursorPaginate({
      model: models.TdbConfigs,
      query: {},
      params: {
        limit: limit || 20,
        cursor,
        orderBy: { createdAt: -1 },
      },
    });

    return result.list.map((config) => config.toJSON());
  },

  async tdbConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const config = await models.TdbConfigs.getConfig({ _id });
    return config.toJSON();
  },
};

export default queries;
