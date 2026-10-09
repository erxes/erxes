import { escapeRegExp, paginate } from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ITechCardDocument } from '../../../@types/techCards';

interface ITechCardsQueryParams {
  searchValue?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

const techCardQueries = {
  techCards: async (
    _root: undefined,
    params: ITechCardsQueryParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readTechCards');

    const query: FilterQuery<ITechCardDocument> = {};

    if (params.status) {
      query.status = params.status;
    }

    if (params.searchValue) {
      const searchRegex = {
        $regex: escapeRegExp(params.searchValue),
        $options: 'i',
      };
      query.$or = [{ name: searchRegex }, { code: searchRegex }];
    }

    const sort: Record<string, SortOrder> = params.sortField
      ? { [params.sortField]: (params.sortDirection ?? 1) as SortOrder }
      : { modifiedAt: -1 };

    return {
      totalCount: await models.TechCards.find(query).countDocuments(),
      techCards: await paginate(models.TechCards.find(query).sort(sort), {
        ...params,
      }),
    };
  },

  techCardDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readTechCards');

    return await models.TechCards.getTechCard(_id);
  },
};

export default techCardQueries;
