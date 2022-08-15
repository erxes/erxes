import { IContext } from '../../../connectionResolver';
import { IRiskAnswerField } from '../../../models/definitions/common';

const RiskAnswerQueries = {
  async riskAnswers(_root, params: IRiskAnswerField, { models }: IContext) {
    return await models.RiskAnswer.riskAnswers();
  },
};

export default RiskAnswerQueries;
