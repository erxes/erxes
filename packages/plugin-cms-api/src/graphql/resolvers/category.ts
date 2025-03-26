import { IContext } from '../../connectionResolver';
import { IPostCategoryDocument } from '../../models/definitions/categories';
import { buildCustomFieldsMap } from './utils';

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
    { models, subdomain }: IContext
  ) {
    const fieldGroups = await models.CustomFieldGroups.find({
      enabledCategoryIds: category._id,
    }).lean();

    return await buildCustomFieldsMap(
      subdomain,
      fieldGroups,
      category.customFieldsData
    );
  },
};

export { PostCategory };
