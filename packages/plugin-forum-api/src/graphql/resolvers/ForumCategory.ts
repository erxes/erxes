import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { ICategory } from '../../db/models/category';

const ForumCategory: IObjectTypeResolver<ICategory, IContext> = {
  async parent({ parentId }, _, { models }) {
    return models.Category.findById(parentId).lean();
  },

  async children({ _id }, _, { models }) {
    return models.Category.find({ parentId: _id }).lean();
  },

  async descendants({ _id }, _, { models }) {
    return models.Category.find({ ancestorIds: _id }).lean();
  },

  async ancestors({ ancestorIds }, _, { models }) {
    return models.Category.find({ _id: { $in: ancestorIds } }).lean();
  }
};

export default ForumCategory;
