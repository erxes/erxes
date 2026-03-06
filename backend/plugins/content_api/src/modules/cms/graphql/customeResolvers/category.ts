import { IContext } from '~/connectionResolvers';

import { buildCustomFieldsMap } from '@/cms/utils/common';
import { IPostCategoryDocument } from '@/cms/@types/posts';

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
    { models, subdomain }: IContext,
  ) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledCategoryIds: category._id,
    }).lean();

    return await buildCustomFieldsMap(
      subdomain,
      fieldGroups,
      category.customFieldsData,
    );
  },
};

export { PostCategory };
