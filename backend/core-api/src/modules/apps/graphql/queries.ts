import { IContext } from '~/connectionResolvers';

export const appQueries = {
  async apps(_parent: undefined, args, { models }: IContext) {
    const { searchValue } = args;
    const qry: any = {};
    if (searchValue) {
      qry.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    return models.Apps.find(qry);
  },

  async appTotalCount(_parent: undefined, args, { models }: IContext) {
    const { searchValue } = args;
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
