import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { updateLiveRemainders } from './utils';

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
    { subdomain }: IContext
  ) => {
    return updateLiveRemainders({ subdomain, ...params });
  }
};

checkPermission(remainderMutations, 'remaindersUpdate', 'manageRemainders');

export default remainderMutations;
