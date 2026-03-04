import { IContext, IModels } from '~/connectionResolvers';
import { paginate } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';


export const cpPms: Record<string, Resolver> = {
  async cpPmsBranchList(
    _root,
    params, 
    { models, commonQuerySelector }: IContext,
    ) {
   
    if (!models) {
      throw new Error('Models not found in context');
    }

    return paginate(
      models.PmsBranch.find(commonQuerySelector || {}),
      params
    );
  },

  async cpPmsBranchDetail(_root, { _id }, context) {
    const { models } = context;

    if (!models) {
      throw new Error('Models not found in context');
    }

    return models.PmsBranch.get({
      $or: [{ _id }, { token: _id }],
    });
  },
};

export default cpPms;

cpPms.cpPmsBranchList.wrapperConfig={
    forClientPortal: true,
}


cpPms.cpPmsBranchDetail.wrapperConfig={
    forClientPortal: true,
}