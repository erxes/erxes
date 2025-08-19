import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  /**
   * Cms tags list
   */
  async cmsTags(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const {
      searchValue,
      status,
      page = 1,
      perPage = 20,
      sortField = 'name',
      sortDirection = 'asc',
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

    const tags = await paginate(
      models.PostTags.find(query).sort({ [sortField]: sortDirection }),
      { page, perPage }
    );

    if (!language) {
      return tags;
    }

    const tagIds = tags.map((tag) => tag._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: tagIds },
      language,
    }).lean();

    const translationsMap = translations.reduce((acc, translation) => {
      acc[translation.postId.toString()] = translation;
      return acc;
    }, {});

    console.log("translationsMap", translationsMap);

    const tagsWithTranslations = tags.map((tag) => {
      const translation = translationsMap[tag._id.toString()];
      tag.name = translation?.title || tag.name;
 
      return tag;
    });

    console.log("tagsWithTranslations", tagsWithTranslations);

    return tagsWithTranslations;
  },

  /**
   * Cms tag
   */
  async cmsTag(_parent: any, args: any, context: IContext): Promise<any> {
    const { models } = context;
    const { _id, slug } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;
    if (!_id && !slug) {
      return null;
    }

    if (slug) {
      return models.PostTags.findOne({ slug, clientPortalId });
    }

    return models.PostTags.findOne({ _id });
  },
};

export default queries;
