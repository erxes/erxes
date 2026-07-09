import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { buildCustomFieldsMap } from '@/cms/utils/common';
import { IPostDocument } from '@/cms/@types/posts';
import { ICustomFieldGroupDocument } from '@/cms/@types/customPostType';

export default {
  async __resolveReference(
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Posts.findOne({ _id });
  },

  seoTitle(post: IPostDocument) {
    return post.seoTitle || post.title || '';
  },

  seoDescription(post: IPostDocument) {
    return post.seoDescription || post.excerpt || '';
  },

  async author(post: IPostDocument) {
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

  async tags(post: IPostDocument, _params: unknown, { models }: IContext) {
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

  async categories(
    post: IPostDocument,
    _params: unknown,
    { models }: IContext,
  ) {
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

  async customPostType(
    post: IPostDocument,
    _params: unknown,
    { models }: IContext,
  ) {
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

  async customFieldsMap(
    post: IPostDocument,
    _params: unknown,
    { models, subdomain }: IContext,
  ) {
    const postType = post.type || 'post';
    const query: FilterQuery<ICustomFieldGroupDocument> = {
      $or: [
        { customPostTypeIds: postType },
        { enabledCategoryIds: { $in: post.categoryIds || [] } },
        { enabledPostIds: { $in: [post._id] } },
      ],
    };

    const fieldGroups = await models.CustomFieldGroups.find(query).lean();

    return await buildCustomFieldsMap(
      subdomain,
      fieldGroups,
      post.customFieldsData,
    );
  },

  async translations(
    post: IPostDocument,
    _params: unknown,
    { models }: IContext,
  ) {
    return models.Translations.find({
      objectId: post._id,
      type: 'post',
    }).lean();
  },
};
