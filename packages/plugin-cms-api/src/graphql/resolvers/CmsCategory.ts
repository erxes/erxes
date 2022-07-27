import { IContext } from '../';

const CmsCategory = {
  async parent({ parentId }, _, { models }: IContext) {
    if (!parentId) return null;
    return models.Category.findById(parentId);
  },

  async children({ _id }, _, { models }: IContext) {
    return models.Category.find({ parentId: _id }).lean();
  },

  async descendants({ _id }, _, { models }: IContext) {
    return models.Category.getDescendantsOf(_id);
  },

  async ancestors({ _id }, _, { models }: IContext) {
    return models.Category.getAncestorsOf(_id);
  }
};

export default CmsCategory;
