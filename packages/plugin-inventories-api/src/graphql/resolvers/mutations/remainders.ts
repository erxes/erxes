import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { updateLiveRemainder } from './utils';

export interface IUpdateRemaindersParams {
  productCategoryId?: string;
  productIds?: string[];
  departmentId: string;
  branchId: string;
}

const remainderMutations = {
  async updateRemainders(
    _root,
    params: IUpdateRemaindersParams,
    { models, subdomain }: IContext
  ) {
    return updateLiveRemainder({ subdomain, ...params });
  }
};

checkPermission(remainderMutations, 'updateRemainders', 'manageRemainders');

export default remainderMutations;
