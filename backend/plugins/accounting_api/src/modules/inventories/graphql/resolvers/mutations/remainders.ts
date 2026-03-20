import { IContext } from '~/connectionResolvers';
import { updateLiveRemainders } from './utils';

export interface IUpdateRemaindersParams {
  departmentId: string;
  branchId: string;
  productCategoryId?: string;
  productIds?: string[];
}

const remainderMutations = {
  remaindersUpdate: async (
    _root: any,
    params: IUpdateRemaindersParams,
    { subdomain, models }: IContext,
  ) => {
    return await updateLiveRemainders({ subdomain, models, ...params });
  },
};

export default remainderMutations;
