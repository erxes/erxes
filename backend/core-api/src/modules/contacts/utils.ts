import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { CONTACT_STATUSES } from './constants';

export const generateFilter = async (params: any, models: IModels) => {
  const {
    searchValue,
    tagIds,
    excludeTagIds,
    tagWithRelated,
    type,
    dateFilters,
    brandIds,
    integrationIds,
    integrationTypes,
    status,
    ids,
    excludeIds,
  } = params;

  const filter = {};

  if (type) {
    filter['state'] = { $eq: type };
  }

  if (status) {
    filter['status'] = { $eq: CONTACT_STATUSES[status] };
  }

  if (searchValue) {
    filter['searchText'] = { $regex: searchValue, $options: 'i' };
  }

  if (ids?.length) {
    filter['_id'] = excludeIds ? { $nin: ids } : { $in: ids };
  }

  if (brandIds || integrationIds || integrationTypes) {
    const relatedIntegrationIdSet = new Set();

    if (brandIds) {
      const integrations = await findIntegrations({
        brandId: { $in: brandIds },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (integrationIds) {
      const integrations = await findIntegrations({
        _id: { $in: integrationIds },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (integrationTypes) {
      const integrations = await findIntegrations({
        kind: { $in: integrationTypes },
      });
      integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
    }

    if (relatedIntegrationIdSet.size > 0) {
      filter['relatedIntegrationIds'] = {
        $in: Array.from(relatedIntegrationIdSet),
      };
    }
  }

  if (tagIds?.length || excludeTagIds?.length) {
    let baseTagIds = tagIds || excludeTagIds || [];

    if (tagWithRelated) {
      const tagObjs = await models.Tags.find({ _id: { $in: baseTagIds } });

      tagObjs.forEach((tag) => {
        baseTagIds = baseTagIds.concat(tag.relatedIds || []);
      });
    }

    baseTagIds = [...new Set(baseTagIds)];

    if (tagIds?.length && excludeTagIds?.length) {
      filter['tagIds'] = {
        $in: baseTagIds.filter((id) => tagIds.includes(id)),
        $nin: baseTagIds.filter((id) => excludeTagIds.includes(id)),
      };
    } else if (tagIds?.length) {
      filter['tagIds'] = { $in: baseTagIds };
    } else if (excludeTagIds?.length) {
      filter['tagIds'] = { $nin: baseTagIds };
    }
  }

  if (dateFilters) {
    try {
      const dateFilter = JSON.parse(dateFilters);

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
    } catch (err) {
      throw new Error(`Invalid dateFilters JSON: ${err}`);
    }
  }

  return filter;
};

export const createOrUpdate = async ({
  collection,
  data: { rows, doNotReplaceExistingValues },
}) => {
  const operations: any = [];

  for (const row of rows) {
    const { selector, doc, customFieldsData } = row;

    const prevEntry = await collection.findOne(selector).lean();

    if (prevEntry) {
      let cfData = prevEntry.customFieldsData || [];

      // remove existing rows
      for (const cf of customFieldsData || []) {
        cfData = cfData.filter(({ field }) => field !== cf.field);
      }

      // add new rows
      for (const cf of customFieldsData || []) {
        cfData.push(cf);
      }

      const newDoc = { ...doc };

      if (doNotReplaceExistingValues) {
        for (const fieldName of Object.keys(doc)) {
          if (prevEntry[fieldName]) {
            delete newDoc[fieldName];
          }
        }
      }

      newDoc.customFieldsData = cfData;

      operations.push({
        updateOne: { filter: selector, update: { $set: newDoc } },
      });
    } else {
      doc.customFieldsData = customFieldsData;
      doc.createdAt = new Date();
      doc.updatedAt = new Date();
      operations.push({ insertOne: { document: doc } });
    }
  }

  return collection.bulkWrite(operations);
};

export const findIntegrations = (query, options?) =>
  sendTRPCMessage({
    pluginName: 'frontline',
    method: 'query',
    module: 'integration',
    action: 'find',
    input: { query },
    defaultValue: [],
    options,
  });
