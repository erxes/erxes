import { IContext } from '~/connectionResolvers';
import { IPostCategoryDocument } from '@/portal/@types/post';
import { buildCustomFieldsMap } from '@/portal/utils/common';

const PostCategory = {
  async parent(category: IPostCategoryDocument, _params, { models }: IContext) {

    if (!category.parentId || !category.parentId.length) {
      return null;
    }
    return models.Categories.findOne({ _id: category.parentId });
  },

  async customFieldsMap(
    category: IPostCategoryDocument,
    _params,
    { models }: IContext
  ) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledCategoryIds: category._id,
    }).lean();

    return await buildCustomFieldsMap(
     
      fieldGroups,
      category.customFieldsData
    );
  },
};

export { PostCategory };
