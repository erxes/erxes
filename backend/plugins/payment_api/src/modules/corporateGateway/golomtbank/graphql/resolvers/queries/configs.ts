import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

type CursorArgs = {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
};

const queries = {
  async golomtBankConfigsList(
    _root,
    { limit, cursor, direction }: CursorArgs,
    { models }: IContext,
  ) {
    return cursorPaginate({
      model: models.GolomtBankConfigs,
      query: {},
      params: {
        limit: limit || 20,
        cursor,
        direction,
        orderBy: { createdAt: -1 },
      },
    });
  },

  async golomtBankConfigs(
    _root,
    { limit, cursor, direction }: CursorArgs,
    { models }: IContext,
  ) {
    return cursorPaginate({
      model: models.GolomtBankConfigs,
      query: {},
      params: {
        limit: limit || 20,
        cursor,
        direction,
        orderBy: { createdAt: -1 },
      },
    });
  },

  async golomtBankConfigsDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.GolomtBankConfigs.getConfig({ _id });
  },
};

export default queries;
