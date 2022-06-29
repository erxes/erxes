import { IContext } from '../../../connectionResolver';
import { FLOW_CATEGORY_STATUSES } from '../../../models/definitions/constants';
import { IFlowCategoryDocument } from '../../../models/definitions/flowCategories';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.FlowCategories.findOne({ _id });
  },

  async flowCount(category: IFlowCategoryDocument, {}, { models }: IContext) {
    const flows = await models.Flows.find({
      categoryId: category._id,
      status: { $ne: FLOW_CATEGORY_STATUSES.ARCHIVED }
    });

    return flows.length;
  }
};
