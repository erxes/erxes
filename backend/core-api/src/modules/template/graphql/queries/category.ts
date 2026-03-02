import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ITemplateCategoryDocument } from '../../@types';

const categoryQueries = {
  templateCategories: async (
    _root: undefined,
    { type, ...params }: { type: string } & ICursorPaginateParams,
    { models }: IContext,
  ) => {
    const filter: FilterQuery<ITemplateCategoryDocument> = {};

    if (type) {
      filter.contentType = type;
    }

    return await cursorPaginate({
      model: models.TemplateCategory,
      params: { ...params, orderBy: { createdBy: -1 } },
      query: filter,
    });
  },

  templateCategory: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.TemplateCategory.getTemplateCategory(_id)
  },

  templatesGetTypes: async () => {
    const plugins = await getPlugins();
    const fieldTypes: Array<{ description: string; type: string }> = [];

    for (const plugin of plugins) {
      const service = await getPlugin(plugin);

      const meta = service?.config?.meta || {};

      if (meta?.templates) {
        const types = meta?.templates?.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            type: `${plugin}:${type.type}`,
          });
        }
      }
    }

    return fieldTypes;
  },
};

export default categoryQueries;
