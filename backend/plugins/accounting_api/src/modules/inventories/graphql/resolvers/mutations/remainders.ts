import { IContext } from '~/connectionResolvers';
import { updateLiveRemainders } from './utils';
import { checkPermission } from 'erxes-api-shared/core-modules';

export interface IUpdateRemaindersParams {
  departmentId?: string;
  branchId?: string;
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

checkPermission(remainderMutations, 'remaindersUpdate', 'manageRemainders');

export default remainderMutations;
