import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskConfirmityField } from '../../../models/definitions/common';

const RiskConfimityMutations = {
  async addRiskConfirmity(_root, params: IRiskConfirmityField, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmityAdd(params);
  },
  async updateRiskConfirmity(_root, params: IRiskConfirmityField, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmityUpdate(params);
  },
  async removeRiskConfirmity(_root, { cardId }: { cardId: string }, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmityRemove(cardId);
  }
};

checkPermission(RiskConfimityMutations, 'addRiskConfirmity', 'manageRiskAssessment');
checkPermission(RiskConfimityMutations, 'updateRiskConfirmity', 'manageRiskAssessment');
checkPermission(RiskConfimityMutations, 'removeRiskConfirmity', 'manageRiskAssessment');

export default RiskConfimityMutations;
