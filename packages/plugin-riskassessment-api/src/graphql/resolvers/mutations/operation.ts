import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const operationMutations = {
  async addOperation(_root, params, { models }: IContext) {
    return await models.Operations.addOperation(params);
  },

  async updateOperation(_root, { _id, ...doc }, { models }: IContext) {
    return await models.Operations.updateOperation(_id, doc);
  },
  async removeOperation(_root, { ids }, { models }: IContext) {
    return await models.Operations.removeOperations(ids);
  }
};

checkPermission(operationMutations, 'addOperation', 'manageRiskAssessment');
checkPermission(operationMutations, 'updateOperation', 'manageRiskAssessment');
checkPermission(operationMutations, 'removeOperation', 'manageRiskAssessment');
export default operationMutations;
