import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

// Escapes regex special characters to prevent injection
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const unitsQueries = {
  async units(
    _root,
    { searchValue }: { searchValue?: string },
    { models }: IContext,
  ) {
    const filter: { $or?: any[] } = {};

    if (searchValue) {
      const escaped = escapeRegExp(searchValue.trim());
      const regexOption = {
        $regex: escaped,
        $options: 'i',
      };

      filter.$or = [
        { title: regexOption },
        { description: regexOption },
      ];
    }

    return models.Units.find(filter).sort({ title: 1 });
  },

  async unitsMain(
    _root,
    params: IListParams & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const filter: { $or?: any[] } = {};

    if (params.searchValue) {
      const escaped = escapeRegExp(params.searchValue.trim());
      const regex = {
        $regex: escaped,
        $options: 'i',
      };

      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Units,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async unitDetail(_root, { _id }, { models }: IContext) {
    return models.Units.getUnit({ _id });
  },
};
