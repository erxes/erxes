import { IContext } from '~/connectionResolvers';

export const appQueries = {
  async apps(
    _parent: undefined,
    { searchValue, page = 1, perPage = 20 }: any,
    { models }: IContext,
  ) {
    const qry: any = {};

    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.Apps.find(qry)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
  },

  async appsTotalCount(
    _parent: undefined,
    { searchValue }: any,
    { models }: IContext,
  ) {
    const qry: any = {};

    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.Apps.countDocuments(qry);
  },

  async appDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Apps.findOne({ _id });
  },
};
