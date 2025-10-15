import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IPostTagDocument } from '../../../@types/post';

const queries = {
  /**
   * Cms tags list
   */
  async cmsTags(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const {
      searchValue,
      status,
      language,
    } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
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
      model: models.PostTags,
      params: args,
      query,
    });

    if (!language) {
      return { list, totalCount, pageInfo };
    }

    const tagIds = list.map((tag) => tag._id);

    const translations = await models.Translations.find({
      postId: { $in: tagIds },
      language,
    }).lean();

    // ✅ Build a translation map for O(1) lookup
    const translationMap = translations.reduce((acc, t) => {
      acc[t.postId.toString()] = t;
      return acc;
    }, {} as Record<string, any>);

    const tagsWithTranslations = list.map((tag) => {
      const translation = translationMap[tag._id.toString()];
      return {
        ...tag,
        ...(translation && {
          name: translation.title || tag.name,
        }),
      };
    });

    return { list: tagsWithTranslations, totalCount, pageInfo };
  },

  /**
   * Cms tag
   */
  async cmsTag(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug, language } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    if (!_id && !slug) {
      return null;
    }

    let tag: IPostTagDocument | null = null;
    if (slug) {
      tag = await models.PostTags.findOne({ slug, clientPortalId });
    } else {
      tag = await models.PostTags.findOne({ _id });
    }

    if (!tag) {
      return null;
    }

    if (!language) {
      return tag;
    }

    const translation = await models.Translations.findOne({
      postId: tag._id,
      language,
      type: 'tag',
    });

    return {
      ...tag,
      ...(translation && {
        name: translation.title || tag.name,
      }),
    };
  },
};

export default queries;
