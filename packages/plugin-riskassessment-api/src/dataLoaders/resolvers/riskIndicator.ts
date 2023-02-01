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
      (riskIndicator.categoryId &&
        dataLoaders.categories.load(riskIndicator.categoryId)) ||
      null
    );
  }
};
