import { IContext } from '~/connectionResolvers';
import { ITemplateDocument } from '../../@types';

export default {
  categories: async (
    { categoryIds }: ITemplateDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    return await models.TemplateCategory.find({
      _id: { $in: categoryIds },
    }).lean();
  },
  createdBy: async (
    { createdBy }: ITemplateDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!createdBy) {
      return null;
    }

    const user = await models.Users.findOne({ _id: createdBy });

    if (!user) {
      return null;
    }

    return user;
  },
  updatedBy: async (
    { updatedBy }: ITemplateDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!updatedBy) {
      return null;
    }

    const user = await models.Users.findOne({ _id: updatedBy });

    if (!user) {
      return null;
    }

    return user;
  },
};
