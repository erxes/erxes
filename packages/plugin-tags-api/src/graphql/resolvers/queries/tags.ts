import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';

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

  async tags(
    _root,
    {
      type,
      searchValue,
      tagIds
    }: { type: string; searchValue?: string; tagIds?: string[] },
    { models, commonQuerySelector }
  ) {
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

    return models.Tags.find(selector).sort({
      order: 1,
      name: 1
    });
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
