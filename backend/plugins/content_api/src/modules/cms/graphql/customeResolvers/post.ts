import { IContext } from '~/connectionResolvers';
import { buildCustomFieldsMap } from '@/cms/utils/common';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Posts.findOne({ _id });
  },

  async author(post: any) {
    if (post.authorKind === 'user') {
      return {
        _id: post.authorId,
        __typename: 'User',
      };
    } else if (post.authorKind === 'clientPortalUser') {
      return {
        _id: post.authorId,
        __typename: 'ClientPortalUser',
      };
    }
  },

  async tags(post: any, _params, { models }: IContext) {
    try {
      if (!post.tagIds || post.tagIds.length === 0) {
        return [];
      }
      const tags = await models.PostTags.find({
        _id: { $in: post.tagIds },
      }).lean();
      return tags || [];
    } catch (error) {
      console.error('Error resolving tags:', error);
      return [];
    }
  },

  async categories(post: any, _params, { models }: IContext) {
    try {
      if (!post.categoryIds || post.categoryIds.length === 0) {
        return [];
      }
      const categories = await models.Categories.find({
        _id: { $in: post.categoryIds },
      }).lean();
      return categories || [];
    } catch (error) {
      console.error('Error resolving categories:', error);
      return [];
    }
  },

  async customPostType(post: any, _params, { models }: IContext) {
    if (!post.type || post.type === 'post') {
      return {
        _id: 'post',
        code: 'post',
        label: 'Post',
        pluralLabel: 'Posts',
        clientPortalId: post.clientPortalId,
        __typename: 'CustomPostType',
      };
    }
    return await models.CustomPostTypes.findOne({ _id: post.type });
  },

  async customFieldsMap(post: any, _params, { models, subdomain }: IContext) {
    // Get field groups for this post type and categories
    const query: any = {
      $or: [
        { customPostTypeIds: post.type },
        { enabledCategoryIds: { $in: post.categoryIds || [] } },
      ],
    };

    const fieldGroups = await models.CustomFieldGroups.find(query).lean();

    return await buildCustomFieldsMap(
      subdomain,
      fieldGroups,
      post.customFieldsData,
    );
  },
};
