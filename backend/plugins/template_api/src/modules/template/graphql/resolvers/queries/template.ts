import { IContext } from '../../../../../connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { TemplateDocument } from '../../../db/definitions/template';

export const templateQueries = {
  templatesGetTypes: async (
    _parent: undefined,
    _args: any,
    { models }: IContext,
  ) => {
    // Return distinct contentTypes as JSON array
    const types = await models.Template.distinct('contentType');
    return types.map((type) => ({ value: type, label: type }));
  },

  templateList: async (
    _parent: undefined,
    params: {
      searchValue?: string;
      categoryIds?: string[];
      page?: number;
      perPage?: number;
      limit?: number;
      cursor?: string;
      contentType?: string;
      status?: string;
    },
    { models }: IContext,
  ) => {
    const { searchValue, categoryIds, contentType, status, page, perPage } =
      params;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (searchValue) {
      filter.$or = [
        { name: { $regex: searchValue, $options: 'i' } },
        { description: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      filter.categoryIds = { $in: categoryIds };
    }

    if (contentType) {
      filter.contentType = contentType;
    }

    // Support both cursor-based and offset-based pagination
    const paginationParams = {
      limit: params.limit || params.perPage || 20,
      cursor: params.cursor,
      orderBy: { createdAt: -1 as const, _id: -1 as const },
    };

    const { list, totalCount, pageInfo } =
      await cursorPaginate<TemplateDocument>({
        model: models.Template,
        params: paginationParams,
        query: filter,
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  templateDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Template.getTemplate(_id);
  },

  categoryList: async (
    _parent: undefined,
    { type }: { type?: string },
    { models }: IContext,
  ) => {
    const filter: any = { status: { $ne: 'inactive' } };

    if (type) {
      filter.contentType = type;
    }

    const totalCount = await models.TemplateCategory.countDocuments(filter);
    const list = await models.TemplateCategory.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return {
      list,
      totalCount,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  },
};
