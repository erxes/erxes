import { IContext } from '../../../connectionResolver';
import { IRiskAnswerField, IRiskConfirmityParams } from '../../../models/definitions/common';

const RiskConfimityQuries = {
  async riskConfirmities(_root, params: IRiskConfirmityParams, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmities(params);
  },
  async riskConfirmityDetails(_root, params: IRiskConfirmityParams, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmityDetails(params);
  },
};

export default RiskConfimityQuries;
