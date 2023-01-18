import { IContext } from '../../connectionResolver';
import { IRiskIndicatorsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskIndicators.findOne({ _id });
  },

  async categories(
    riskIndicator: IRiskIndicatorsDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (riskIndicator.categoryIds &&
        dataLoaders.categories.load(riskIndicator.categoryIds)) ||
      null
    );
  }
};
