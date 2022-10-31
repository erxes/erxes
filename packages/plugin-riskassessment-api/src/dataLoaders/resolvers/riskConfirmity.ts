import { IRiskConfirmityDocument } from '../../models/definitions/confimity';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskAssessment.findOne({ _id });
  },

  async riskAssessment(
    riskConfimity: IRiskConfirmityDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskConfimity.riskAssessmentId &&
        dataLoaders.riskAssessment.load(riskConfimity.riskAssessmentId)) ||
      null
    );
  }
};
