import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { generateFilters } from './utils';

export const positionQueries = {
  async positions(
    _parent: undefined,
    params: any & { searchValue?: string },
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'position',
      params,
    });
    const pipeline: any[] = [{ $match: filter }, { $sort: { order: 1 } }];

    if (params?.ids?.length) {
      pipeline.push({
        $addFields: {
          __order: { $indexOfArray: [params.ids, '$_id'] },
        },
      });
      pipeline.push({ $sort: { __order: 1 } });
    }

    return models.Positions.aggregate(pipeline);
  },

  async positionsMain(
    _parent: undefined,
    params: IListParams & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'position',
      params: { ...params, withoutUserFilter: true },
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Positions,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async positionDetail(_parent: undefined, { _id }, { models }: IContext) {
    return models.Positions.getPosition({ _id });
  },
};
