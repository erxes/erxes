import { IContext } from '~/connectionResolvers';
import { buildCustomFieldsMap } from '@/portal/utils/common';


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
    return models.PostTags.find({ _id: { $in: post.tagIds } }).lean();
  },

  async categories(post: any, _params, { models }: IContext) {
    return models.Categories.find({ _id: { $in: post.categoryIds } }).lean();
  },

  async customFieldsMap(post: any, _params, { models }: IContext) {
    const fieldGroups = await models.CustomFieldGroups.find({
      customPostTypeIds: post.type,
    }).lean();

    return await buildCustomFieldsMap( fieldGroups, post.customFieldsData);
  },

  async customPostType(post: any, _params, { models }: IContext) {
    if (!post.type || post.type === 'post') {
      return {
        _id: 'post',
        code: 'post',
        label: 'Post',
        pluralLabel: 'Posts',
        __typename: 'CustomPostType',
      };
    }
    return await models.CustomPostTypes.findOne({ _id: post.type });
  },
};
