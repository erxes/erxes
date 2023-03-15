import { IContext } from '../../connectionResolver';
import { IRiskIndicatorsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskIndicators.findOne({ _id });
  },

  async category(
    riskIndicator: IRiskIndicatorsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskIndicator.tagIds &&
        dataLoaders.categories.load(riskIndicator.tagIds)) ||
      null
    );
  }
};
