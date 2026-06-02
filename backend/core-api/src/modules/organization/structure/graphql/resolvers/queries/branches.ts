import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { generateFilters } from './utils';
import {
  Resolver
} from 'erxes-api-shared/core-types';

export const branchsQueries : Record<string, Resolver> = {
  async branches(
    _parent: undefined,
    params: any & { searchValue?: string },
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
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

    return models.Branches.aggregate(pipeline);
  },

  async branchesMain(
    _parent: undefined,
    params: IListParams & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
      params,
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Branches,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async branchDetail(_parent: undefined, { _id }, { models }: IContext) {
    return models.Branches.getBranch({ _id });
  },

  async cpBranches(
    _parent: undefined,
    params: any & { searchValue?: string },
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
      params: { ...params, withoutUserFilter: true },
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

    return models.Branches.aggregate(pipeline);
  },

  async cpBranchesMain(
    _parent: undefined,
    params: IListParams & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
      params: { ...params, withoutUserFilter: true },
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Branches,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async cpBranchDetail(_parent: undefined, { _id }, { models }: IContext) {
    return models.Branches.getBranch({ _id });
  },
};

branchsQueries.cpBranches.wrapperConfig = {
  forClientPortal: true,
};
branchsQueries.cpBranchesMain.wrapperConfig = {
  forClientPortal: true,
};
branchsQueries.cpBranchDetail.wrapperConfig = {
  forClientPortal: true,
};