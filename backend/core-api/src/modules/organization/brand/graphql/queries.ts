import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IBrandDocument } from '../types';

export const brandQueries = {
  /**
   * All brands
   */
  async allBrands(_root: undefined, _params: undefined, { models }: IContext) {
    return await models.Brands.find().lean();
  },

  /**
   * Brands list
   */
  async brands(_root: undefined, params, { models }: IContext) {
    const { searchValue } = params;

    const filter: any = {};

    if (searchValue) {
      filter.name = new RegExp(`.*${params.searchValue}.*`, 'i');
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<IBrandDocument>(
      {
        model: models.Brands,
        params,
        query: filter,
      },
    );

    return { list, totalCount, pageInfo };
  },

  /**
   * Get one brand
   */
  async brandDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.Brands.findOne({ _id });
  },

  /**
   * Get all brands count. We will use it in pager
   */
  async brandsTotalCount(_root: undefined, _args, { models }: IContext) {
    return await models.Brands.countDocuments();
  },

  /**
   * Get last brand
   */
  async brandsGetLast(_root: undefined, _args, { models }: IContext) {
    return await models.Brands.findOne({}).sort({ createdAt: -1 });
  },
};
