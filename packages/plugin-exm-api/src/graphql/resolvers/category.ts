import { IContext } from '../../connectionResolver';
import { ICategoryDocument } from '../../models/Exms';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.ExmCategories.findOne({ _id });
  },

  isRoot(category: ICategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async count(category: ICategoryDocument, {}, { models }: IContext) {
    const category_ids = await models.ExmCategories.find({
      order: { $regex: new RegExp(category.order) }
    }).distinct('_id');

    return models.Exms.countDocuments({
      categoryId: { $in: category_ids }
    });
  }
};
