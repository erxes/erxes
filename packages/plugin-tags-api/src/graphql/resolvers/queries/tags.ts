import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';

const tagQueries = {
  /**
   * Tags list
   */

  async tagsGetTypes() {
    const services = await serviceDiscovery.getServices();
    const fieldTypes: Array<{ description: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};
      if (meta && meta.tags) {
        const types = meta.tags.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${serviceName}:${type.type}`
          });
        }
      }
    }

    return fieldTypes;
  },

  async tagsQueryCount(
    _root,
    {
      type,
      searchValue
    }: {
      type: string;
      searchValue?: string;
    },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };

    if (type) {
      selector.type = type;
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    const tagsCount = await models.Tags.find(selector).count();

    return tagsCount;
  },

  async tags(
    _root,
    {
      type,
      searchValue,
      tagIds,
      parentId,
      page,
      perPage
    }: {
      type: string;
      searchValue?: string;
      tagIds?: string[];
      parentId?: string;
      page: any;
      perPage: any;
    },
    { models, commonQuerySelector, serverTiming }: IContext
  ) {
    serverTiming.startTime('query');

    const selector: any = { ...commonQuerySelector };

    if (type) {
      selector.type = type;
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (tagIds) {
      selector._id = { $in: tagIds };
    }

    if (parentId) {
      const parentTag = await models.Tags.find({ parentId }).distinct('_id');
      let ids = [parentId, ...parentTag];

      const getChildTags = async (parentTagIds: string[]) => {
        const childTag = await models.Tags.find({
          parentId: { $in: parentTagIds }
        }).distinct('_id');

        if (childTag.length > 0) {
          ids = [...ids, ...childTag];
          await getChildTags(childTag);
        }

        return;
      };

      await getChildTags(parentTag);

      selector._id = { $in: ids };
    }

    const tags = await paginate(
      models.Tags.find(selector).sort({
        order: 1,
        name: 1
      }),
      { page, perPage }
    );

    serverTiming.endTime('query');

    return tags;
  },

  /**
   * Get one tag
   */
  tagDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Tags.findOne({ _id });
  }
};

requireLogin(tagQueries, 'tagDetail');
checkPermission(tagQueries, 'tags', 'showTags', []);

export default tagQueries;
