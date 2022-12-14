import { IRiskConformityDocument } from '../../models/definitions/confimity';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiksFormSubmissions.findOne({ _id });
  },

  async riskAssessment(riskConfimity: IRiskConformityDocument, {}, { dataLoaders }: IContext) {
    return (
      (riskConfimity.riskAssessmentId &&
        dataLoaders.riskAssessment.load(riskConfimity.riskAssessmentId)) ||
      null
    );
  }
};
