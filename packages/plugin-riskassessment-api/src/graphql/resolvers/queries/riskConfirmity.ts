import { IContext } from '../../../connectionResolver';
import { IRiskAnswerField } from '../../../models/definitions/common';

const RiskConfimityQuries = {
  async riskAnswers(_root, params: IRiskAnswerField, { models }: IContext) {
    return await models.RiskConfimity.riskConfirmities();
  },
};

export default RiskConfimityQuries;
