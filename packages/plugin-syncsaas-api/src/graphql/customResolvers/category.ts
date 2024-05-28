import { ICategoryDocument } from '../../models/definitions/sync';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Categories.findOne({ _id });
  },

  isRoot(category: ICategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async count(category: ICategoryDocument, {}, { models }: IContext) {
    const category_ids = await models.Categories.find({
      order: { $regex: new RegExp(category.order) }
    }).distinct('_id');

    return models.Sync.countDocuments({
      categoryId: { $in: category_ids }
    });
  }
};
