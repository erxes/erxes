import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { ICategory } from '../../db/models/category';

const ForumCategory: IObjectTypeResolver<ICategory, IContext> = {
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

export default ForumCategory;
