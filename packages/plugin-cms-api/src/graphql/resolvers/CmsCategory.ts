import { IContext } from '../';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { ICategory, ICategoryDocument } from '../../db/models/category';

const CmsCategory: IObjectTypeResolver<ICategory, IContext> = {
  async parent({ parentId }, _, { models }) {
    return models.Category.findById(parentId);
  },

  async children({ _id }, _, { models }) {
    return models.Category.find({ parentId: _id }).lean();
  },

  async descendants({ _id }, _, { models }) {
    return models.Category.getDescendantsOf(_id);
  },

  async ancestors({ _id }, _, { models }) {
    return models.Category.getAncestorsOf(_id);
  }
};

export default CmsCategory;
