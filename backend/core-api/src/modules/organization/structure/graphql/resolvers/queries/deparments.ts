import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { generateFilters } from './utils';

export const deparmentQueries = {
  async departments(
    _parent: undefined,
    params: any,
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'department',
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
    return models.Departments.aggregate(pipeline);
  },

  async departmentsMain(
    _parent: undefined,
    params: IListParams & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'department',
      params: { ...params, withoutUserFilter: true },
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Departments,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async departmentDetail(_parent: undefined, { _id }, { models }: IContext) {
    return models.Departments.getDepartment({ _id });
  },
};
