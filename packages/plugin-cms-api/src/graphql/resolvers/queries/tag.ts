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

    const tagsWithTranslations = tags.map((tag) => {
      const translation = translationsMap[tag._id.toString()];
      tag.name = translation?.title || tag.name;

      return tag;
    });

    return tagsWithTranslations;
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

    let translation: any = null;
    let tag: any = null;

    if (language) {
      translation = await models.PostTranslations.findOne({
        postId: _id,
        language,
      }).lean();
    }

    if (slug) {
      tag = await models.PostTags.findOne({ slug, clientPortalId }).lean();
    } else if (_id) {
      tag = await models.PostTags.findOne({ _id }).lean();
    }

    if (!tag) {
      return null;
    }

    if (!language) {
      return tag;
    }

    if (translation) {
      tag.name = translation.title || tag.name;
    }

    return tag;
  },

  async cmsTagsCount(_parent: any, args: any, context: IContext): Promise<number> {
    const { models } = context;
    const { searchValue, status } = args;
    const clientPortalId = args.clientPortalId || context.clientPortalId;

    const query: any = { clientPortalId };
    if (status) query.status = status;

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { slug: { $regex: searchValue, $options: 'i' } },
      ];
    }

    // ✅ Await the query result before returning
    const count = await models.PostTags.countDocuments(query);
    return count;
  },
};

export default queries;
