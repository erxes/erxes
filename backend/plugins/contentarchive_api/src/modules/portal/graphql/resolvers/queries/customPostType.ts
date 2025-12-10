import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

import { Resolver } from 'erxes-api-shared/core-types';

 const queries: Record<string, Resolver> = {
  cmsCustomFieldGroupList: async (
    _parent: any,
    args: any,
    { models }: IContext,
  ) => {
    const { clientPortalId, searchValue } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { code: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomFieldGroups,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  cmsCustomFieldGroups: async (_parent: any, args: any, context: IContext) => {
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

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomFieldGroups,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  async cmsCustomFieldGroup(_parent: any, args: any, context: IContext) {
    const { models } = context;
    const { _id } = args;
    return models.CustomFieldGroups.findOne({ _id });
  },

  cmsCustomPostTypeList: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { searchValue, clientPortalId } = args;

    const query: any = {
      clientPortalId,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomPostTypes,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  cmsCustomPostTypes: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { searchValue, clientPortalId } = args;

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

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.CustomPostTypes,
      params: args,
      query,
    });

    defaultTypes.forEach((type) => {
      list.unshift(type);
    });

    return { list, totalCount, pageInfo };
  },

  cmsPostType: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.findOne({ _id });
  },

  // cpCustomPostTypes(searchValue: String): [CustomPostType]
  // cpCustomFieldGroups(searchValue: String, pageId: String, categoryId: String, postType: String): [CustomFieldGroup]

  cpCustomPostTypes: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models } = context;
    const { searchValue, clientPortalId } = args;

    const query: any = {
      clientPortalId,
      isActive: true,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    const { list } = await cursorPaginate({
      model: models.CustomPostTypes,
      params: args,
      query,
    });

    return list;
  },

  cpCustomFieldGroups: async (
    _parent: any,
    args: any,
    context: IContext,
  ): Promise<any> => {
    const { models, clientPortal } = context;
    const { searchValue, postType, pageId, categoryId } = args;

    const query: any = {
      clientPortalId: clientPortal._id,
      isActive: true,
    };

    if (searchValue) {
      query.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { label: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (args.postType) {
      query.customPostTypeIds = postType;
    }

    if (pageId) {
      query.enabledPageIds = pageId;
    }

    if (categoryId) {
      query.enabledCategoryIds = categoryId;
    }

    return models.CustomFieldGroups.find(query);
  },
};

queries.cpCustomFieldGroups.wrapperConfig = {
  forClientPortal: true,
};

queries.cpCustomPostTypes.wrapperConfig = {
  forClientPortal: true,
};

export default queries;
