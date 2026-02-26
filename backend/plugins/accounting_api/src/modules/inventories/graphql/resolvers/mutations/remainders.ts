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
  // TODO remove code
  remaindersUpdate: async (
    _root: any,
    params: IUpdateRemaindersParams,
    { subdomain }: IContext,
  ) => {
    return updateLiveRemainders({ subdomain, ...params });
  },
};

checkPermission(remainderMutations, 'remaindersUpdate', 'manageRemainders');

export default remainderMutations;
