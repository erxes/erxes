import { IContext } from '~/connectionResolvers';
import { ITemplateCategoryDocument } from '../../@types';

export default {
  templateCount: async (
    { _id }: ITemplateCategoryDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    return await models.Template.find({
      categoryIds: { $in: [_id] },
    }).countDocuments();
  },
  isRoot: async ({ parentId }: ITemplateCategoryDocument) => {
    return !parentId;
  },
  createdBy: async (
    { createdBy }: ITemplateCategoryDocument,
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
    { updatedBy }: ITemplateCategoryDocument,
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
