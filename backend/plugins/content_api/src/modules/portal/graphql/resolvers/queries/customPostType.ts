import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const queries = {
  async cmsCustomFieldGroupList(_parent: any, args: any, context: IContext) {
    const { models } = context;
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
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const {  searchValue } = args;
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
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.CustomPostTypes.findOne({ _id });
  },
};

export default queries;
