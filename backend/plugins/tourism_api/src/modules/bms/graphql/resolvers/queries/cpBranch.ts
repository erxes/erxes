import { IContext, IModels } from '~/connectionResolvers';
import { cursorPaginate, paginate } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';

export const cpBms: Record<string, Resolver> = {
  async cpBmsBranchList(
    _root,
    params,
    { models, commonQuerySelector }: IContext,
  ) {
    if (!models) {
      throw new Error('Models not found in context');
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Branches,
      params,
      query: commonQuerySelector || {},
    });

    return { list, totalCount, pageInfo };
  },

  async cpBmsBranches(_root, params, context: IContext, info) {
    const { models } = context;

    if (!models) {
      throw new Error('Models not found in context');
    }

    return paginate(models.Branches.find(), params);
  },

  async cpBmsBranchDetail(_root, { _id }, context) {
    const { models } = context;

    if (!models) {
      throw new Error('Models not found in context');
    }

    return models.Branches.get({
      $or: [{ _id }, { token: _id }],
    });
  },
};

export default cpBms;

cpBms.cpBmsBranchList.wrapperConfig = {
  forClientPortal: true,
};

cpBms.cpBmsBranches.wrapperConfig = {
  forClientPortal: true,
};

cpBms.cpBmsBranchDetail.wrapperConfig = {
  forClientPortal: true,
};
