import { cursorPaginate, getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import {
  ITemplateCategoryDocument,
  ITemplateCategoryParams,
} from '../../@types';

const categoryQueries = {
  templateCategories: async (
    _root: undefined,
    params: ITemplateCategoryParams,
    { models }: IContext,
  ) => {
    const { searchValue, types, parentIds, createdBy, updatedBy, dateFilters } =
      params || {};

    const filter: FilterQuery<ITemplateCategoryDocument> = {
      parentId: { $in: [null, ''] },
    };

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (types?.length) {
      filter.contentType = { $in: types };
    }

    if (parentIds?.length) {
      filter.parentId = { $in: parentIds };
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (updatedBy) {
      filter.updatedBy = updatedBy;
    }

    if (dateFilters) {
      try {
        const dateFilter = JSON.parse(dateFilters || '{}');

        for (const [key, value] of Object.entries(dateFilter)) {
          const { gte, lte } = (value || {}) as { gte?: string; lte?: string };

          if (gte || lte) {
            filter[key] = {};

            if (gte) {
              filter[key]['$gte'] = gte;
            }

            if (lte) {
              filter[key]['$lte'] = lte;
            }
          }
        }
      } catch (error) {
        throw new Error(`Invalid dateFilters: ${error.message}`);
      }
    }

    return await cursorPaginate({
      model: models.TemplateCategory,
      params: {
        ...params,
        orderBy: {
          createdAt: -1,
          _id: -1,
        },
      },
      query: filter,
    });
  },

  templateCategory: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.TemplateCategory.getTemplateCategory(_id);
  },

  templatesGetTypes: async () => {
    const plugins = await getPlugins();
    const fieldTypes: Array<{ label: string; description: string; type: string }> = [];

    for (const plugin of plugins) {
      const service = await getPlugin(plugin);
      const meta = service?.config?.meta || {};

      const templates = meta?.templates;

      if (!templates?.modules) {
        continue;
      }

      for (const [moduleName, handler] of Object.entries(templates.modules)) {
        for (const [typeName, template] of Object.entries(handler as Record<string, any>)) {
          fieldTypes.push({
            label: template.label || typeName,
            description: template.description || typeName,
            type: `${plugin}:${moduleName}:${typeName}`,
          });
        }
      }
    }

    return fieldTypes;
  },
};

export default categoryQueries;
