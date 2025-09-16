import { ITagFilterQueryParams } from '@/tags/@types/tag';
import { cursorPaginate, getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = async ({ params, commonQuerySelector, models }) => {
  const { searchValue, parentId, ids, excludeIds, isGroup, type } = params;

  const filter: FilterQuery<ITagFilterQueryParams> = { ...commonQuerySelector, type: { $in: [null, ''] } };

  if (type) {
    let contentType = type;

    const [_pluginName, _moduleName, instanceId] = contentType.split(':');

    if (!instanceId && params.instanceId) {
      contentType = `${contentType}:${params.instanceId}`;
    }

    filter.type = contentType;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (isGroup) {
    filter.isGroup = isGroup;
  }

  if (parentId) {
    const parentTag = await models.Tags.find({ parentId }).distinct('_id');

    let ids = [parentId, ...parentTag];

    const getChildTags = async (parentTagIds: string[]) => {
      const childTag = await models.Tags.find({
        parentId: { $in: parentTagIds },
      }).distinct('_id');

      if (childTag.length > 0) {
        ids = [...ids, ...childTag];
        await getChildTags(childTag);
      }
    };

    await getChildTags(parentTag);

    filter._id = { $in: ids };
  }

  return filter;
};

export const tagQueries = {
  /**
   * Get tags types
   */
  async tagsGetTypes() {
    const services = await getPlugins();
    const fieldTypes: Array<{ description: string; contentType: string }> = [];
    for (const serviceName of services) {
      const service = await getPlugin(serviceName);
      const meta = service.config.meta || {};
      if (meta && meta.tags) {
        const types = meta.tags.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${serviceName}:${type.type}`,
          });
        }
      }
    }

    return fieldTypes;
  },
  /**
   * Get tags
   */
  async tags(
    _parent: undefined,
    params: ITagFilterQueryParams,
    { models, commonQuerySelector }: IContext,
  ) {
    const filter = await generateFilter({
      params,
      commonQuerySelector,
      models,
    });

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Tags,
      params,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async tagsQueryCount(
    _parent: undefined,
    {
      type,
      searchValue,
    }: {
      type: string;
      searchValue?: string;
    },
    { models, commonQuerySelector }: IContext,
  ) {
    const selector: any = { ...commonQuerySelector };

    if (type) {
      selector.type = type;
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.Tags.countDocuments(selector);
  },

  async tagDetail(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Tags.getTag(_id);
  },
};
