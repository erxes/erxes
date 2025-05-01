import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const queries = {
  async cmsCustomFieldGroupList(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { clientPortalId, searchValue, page = 1, perPage = 20 } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const totalCount =
      await models.CustomFieldGroups.find(query).countDocuments();

    const list = await paginate(models.CustomFieldGroups.find(query), {
      page,
      perPage,
    });

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list,
    };
  },
  async cmsCustomFieldGroups(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { clientPortalId, searchValue, pageId, categoryId } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (args.postType) {
      query.customPostTypeIds = args.postType;
    }

    if (pageId) {
      query.enabledPageIds = pageId;
    }

    if (categoryId) {
      query.enabledCategoryIds = categoryId;
    }

    if (args.page && args.perPage) {
      return paginate(models.CustomFieldGroups.find(query), {
        page: args.page,
        perPage: args.perPage,
      });
    }

    return models.CustomFieldGroups.find(query);
  },

  async cmsCustomFieldGroup(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;
    return models.CustomFieldGroups.findOne({ _id });
  },

  cmsCustomPostTypeList: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { page = 1, perPage = 20, searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const totalCount =
      await models.CustomPostTypes.find(query).countDocuments();

    const list = await paginate(models.CustomPostTypes.find(query), {
      page,
      perPage,
    });

    const totalPages = Math.ceil(totalCount / perPage);

    return { totalCount, totalPages, currentPage: page, list };
  },

  cmsCustomPostTypes: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { searchValue } = args;
    const clientPortalId = context.clientPortalId || args.clientPortalId;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const defaultTypes: any = [
      {
        _id: 'post',
        clientPortalId,
        label: 'Post',
        pluralLabel: 'Posts',
        code: 'post',
      },
      {
        _id: 'page',
        clientPortalId,
        label: 'Page',
        pluralLabel: 'Pages',
        code: 'page',
      },
      {
        _id: 'category',
        clientPortalId,
        label: 'Category',
        pluralLabel: 'Categories',
        code: 'category',
      },
    ];

    if (args.page && args.perPage) {
      const list = await paginate(models.CustomPostTypes.find(query), {
        page: args.page,
        perPage: args.perPage,
      });

      defaultTypes.forEach((type) => {
        list.unshift(type);
      });

      return list;
    }

    const list = await models.CustomPostTypes.find(query).lean();

    defaultTypes.forEach((type) => {
      list.unshift(type);
    });

    return list;
  },

  cmsPostType: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.findOne({ _id });
  },
};

export default queries;
