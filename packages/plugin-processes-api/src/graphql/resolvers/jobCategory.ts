import { IContext } from '../../connectionResolver';
import { JOB_CATEGORY_STATUSES } from '../../models/definitions/constants';
import { IJobCategoryDocument } from '../../models/definitions/jobCategories';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.JobCategories.findOne({ _id });
  },

  async productCount(category: IJobCategoryDocument, {}, { models }: IContext) {
    const products = await models.JobRefers.find({
      categoryId: category._id,
      status: { $ne: JOB_CATEGORY_STATUSES.ARCHIVED }
    });

    console.log('resolver: ', products);

    return products.length;
  }
};
