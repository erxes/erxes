import { IRiskConformityDocument } from '../../models/definitions/confimity';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiksFormSubmissions.findOne({ _id });
  },

  async riskIndicator(
    riskConfimity: IRiskConformityDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskConfimity.riskIndicatorIds &&
        dataLoaders.riskIndicator.load(riskConfimity.riskIndicatorIds)) ||
      null
    );
  }
};
