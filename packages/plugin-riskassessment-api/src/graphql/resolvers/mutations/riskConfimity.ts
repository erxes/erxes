import { IContext } from '../../../connectionResolver';
import { IRiskConfirmityField } from '../../../models/definitions/common';

const RiskConfimityMutations = {
  async riskConfirmityAdd(_root, params: IRiskConfirmityField, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmyAdd(params);
  },
};

export default RiskConfimityMutations;
