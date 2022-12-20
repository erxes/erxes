import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IRiskConformityField } from '../../../models/definitions/common';

const RiskConfimityMutations = {
  async addRiskConformity(
    _root,
    params: IRiskConformityField,
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformityAdd(params);
  },
  async updateRiskConformity(
    _root,
    params: IRiskConformityField,
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformityUpdate(params);
  },
  async removeRiskConformity(
    _root,
    { cardId }: { cardId: string },
    { models }: IContext
  ) {
    return await models.RiskConformity.riskConformityRemove(cardId);
  }
};

checkPermission(
  RiskConfimityMutations,
  'addRiskConformity',
  'manageRiskAssessment'
);
checkPermission(
  RiskConfimityMutations,
  'updateRiskConformity',
  'manageRiskAssessment'
);
checkPermission(
  RiskConfimityMutations,
  'removeRiskConformity',
  'manageRiskAssessment'
);

export default RiskConfimityMutations;
