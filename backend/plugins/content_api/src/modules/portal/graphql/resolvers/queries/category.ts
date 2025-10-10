import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IPostCategoryDocument } from '../../../@types/post';

const queries = {
  /**
   * Cms categories list
   */
  async cmsCategories(
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models } = context;
    const { searchValue, status, language } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;
    const query = {
      clientPortalId,
      ...(status && { status }),
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Categories,
      params: args,
      query,
    });

    if (!language) {
      return { list, totalCount, pageInfo };
    }

    const categoryIds = list.map((category) => category._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: categoryIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const translatedList = list.map((category) => {
      const translation = translationMap[category._id.toString()];
      return {
        ...category,
        ...(translation && {
          name: translation.title || category.name,
          description:
            translation.excerpt || translation.content || category.description,
        }),
      };
    });

    return { list: translatedList, totalCount, pageInfo };
  },

  /**
   * Cms category
   */
  async cmsCategory(_parent: any, args: any, context: IContext): Promise<any> {
    const { models, clientPortalId } = context;
    const { _id, slug, language } = args;

    if (!_id && !slug) {
      return null;
    }

    let category: IPostCategoryDocument | null = null;
    if (slug) {
      category = await models.Categories.findOne({ slug, clientPortalId });
    } else {
      category = await models.Categories.findOne({ _id });
    }

    if (!category) {
      return null;
    }

    if (!language) {
      return category;
    }

    const translation = await models.PostTranslations.findOne({
      postId: category._id,
      language,
    });

    return {
      ...category,
      ...(translation && {
        name: translation.title || category.name,
        description:
          translation.excerpt || translation.content || category.description,
      }),
    };
  },
};

export default queries;
