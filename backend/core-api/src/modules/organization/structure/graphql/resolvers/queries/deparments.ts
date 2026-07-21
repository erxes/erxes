import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { generateFilters } from './utils';
import { STRUCTURE_STATUSES } from 'erxes-api-shared/core-modules';
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
      params,
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

  async cpDepartments(
    _root,
    params,
    { models }: IContext,
  ) {
    const filter: any = {
      status: { $ne: STRUCTURE_STATUSES.DELETED },
    };

    if (params?.ids?.length) {
      filter._id = {
        [params.excludeIds ? '$nin' : '$in']: params.ids,
      };
    }

    if (params?.status) {
      filter.status = params.status;
    }

    if (params?.onlyFirstLevel) {
      filter.parentId = { $in: [null, ''] };
    }

    if (params?.parentId) {
      filter.parentId = params.parentId;
    }

    if (params?.searchValue) {
      const regex = {
        $regex: `.*${params.searchValue.trim()}.*`,
        $options: 'i',
      };

      filter.$or = [
        { title: regex },
        { description: regex },
        { code: regex },
      ];
    }

    return models.Departments.find(filter).sort({ order: 1 });
  },
};
