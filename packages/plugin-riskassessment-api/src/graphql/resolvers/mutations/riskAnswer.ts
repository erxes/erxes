import { IContext } from '../../../connectionResolver';
import { IRiskAnswerField } from '../../../models/definitions/common';

const RiskAnswerMutations = {
  async addRiskAnswer(_root, params: IRiskAnswerField, { models }: IContext) {
    return await models.RiskAnswer.riskAnswerAdd(params);
  },
};
export default RiskAnswerMutations;
