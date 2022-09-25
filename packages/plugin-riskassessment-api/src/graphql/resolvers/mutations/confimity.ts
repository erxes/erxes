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

export default RiskConfimityMutations;
