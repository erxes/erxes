import { buildPropertyFilter } from 'erxes-api-shared/core-modules';
import {
  buildSearchTokenFilter,
  ISearchTokenConfig,
  MessageProps,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import type { mongo } from 'mongoose';
import { CONTACT_STATUSES } from './constants';

type ContactFilter = Record<string, unknown>;

interface ContactFilterParams {
  searchValue?: string;
  tagIds?: string[];
  excludeTagIds?: string[];
  tagWithRelated?: boolean;
  type?: string;
  dateFilters?: string;
  propertiesData?: string;
  brandIds?: string[];
  integrationIds?: string[];
  integrationTypes?: string[];
  status?: string;
  ids?: string[];
  excludeIds?: boolean;
  segmentIds?: string[];
  clientPortalId?: string;
  emailValidationStatus?: string;
}

/** Queries tenant integrations through the Frontline service contract. */
export const findIntegrations = (
  subdomain: string,
  query: Record<string, unknown>,
  options?: MessageProps['options'],
) =>
  sendTRPCMessage({
    subdomain,

    pluginName: 'frontline',
    method: 'query',
    module: 'integration',
    action: 'find',
    input: { query },
    defaultValue: [],
    options,
  });

/** Applies contact state, portal membership, and email validation filters. */
const applyBasicFilters = async (
  filter: ContactFilter,
  params: ContactFilterParams,
  models: IModels,
) => {
  const { type, status, clientPortalId, emailValidationStatus } = params;

  if (type) {
    filter['state'] = { $eq: type };
  }

  if (status) {
    filter.status = { $eq: CONTACT_STATUSES[status] };
  }

  if (clientPortalId) {
    const customerIds = await models.CPUser.find({ clientPortalId }).distinct(
      'erxesCustomerId',
    );

    filter['$and'] = [{ _id: { $in: customerIds } }];
  }

  if (emailValidationStatus) {
    filter['emailValidationStatus'] = { $eq: emailValidationStatus };
  }
};

/** Uses configured search tokens or the legacy contact text fields. */
const applySearchFilter = (
  filter: ContactFilter,
  params: ContactFilterParams,
  searchConfig?: ISearchTokenConfig,
) => {
  const { searchValue } = params;

  if (!searchValue) {
    return;
  }

  if (searchConfig?.enabled) {
    Object.assign(filter, buildSearchTokenFilter(searchValue, searchConfig));
    return;
  }

  const regex = { $regex: searchValue, $options: 'i' };

  filter['$or'] = [
    { searchText: regex },
    { primaryEmail: regex },
    { emails: regex },
    { primaryPhone: regex },
    { phones: regex },
    { firstName: regex },
    { lastName: regex },
    { middleName: regex },
  ];
};

/** Includes or excludes the explicitly selected contact IDs. */
const applyIdFilter = (filter: ContactFilter, params: ContactFilterParams) => {
  const { ids, excludeIds } = params;

  if (ids?.length) {
    filter['_id'] = excludeIds ? { $nin: ids } : { $in: ids };
  }
};

/** Resolves integrations matching the selected brands, IDs, or kinds. */
const collectRelatedIntegrationIds = async (
  subdomain: string,
  params: ContactFilterParams,
) => {
  const { brandIds, integrationIds, integrationTypes } = params;
  const relatedIntegrationIdSet = new Set<string>();

  if (brandIds) {
    const integrations = await findIntegrations(subdomain, {
      brandId: { $in: brandIds },
    });
    integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
  }

  if (integrationIds) {
    const integrations = await findIntegrations(subdomain, {
      _id: { $in: integrationIds },
    });
    integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
  }

  if (integrationTypes) {
    const integrations = await findIntegrations(subdomain, {
      kind: { $in: integrationTypes },
    });
    integrations.forEach((i) => relatedIntegrationIdSet.add(i._id));
  }

  return relatedIntegrationIdSet;
};

/** Restricts contacts to the matching integration relationships. */
const applyIntegrationFilter = async (
  filter: ContactFilter,
  subdomain: string,
  params: ContactFilterParams,
) => {
  const { brandIds, integrationIds, integrationTypes } = params;

  if (!(brandIds || integrationIds || integrationTypes)) {
    return;
  }

  const relatedIntegrationIdSet = await collectRelatedIntegrationIds(
    subdomain,
    params,
  );

  if (relatedIntegrationIdSet.size > 0) {
    filter['relatedIntegrationIds'] = {
      $in: Array.from(relatedIntegrationIdSet),
    };
  }
};

/** Deduplicates selected tags and optionally includes their related tags. */
const resolveTagIds = async (
  params: ContactFilterParams,
  models: IModels,
  baseTagIds: string[],
) => {
  const { tagWithRelated } = params;

  if (!tagWithRelated) {
    return [...new Set(baseTagIds)];
  }

  const tagObjs = await models.Tags.find({ _id: { $in: baseTagIds } });

  for (const tag of tagObjs) {
    baseTagIds = baseTagIds.concat(tag.relatedIds || []);
  }

  return [...new Set(baseTagIds)];
};

/** Resolves included and excluded tag sets independently. */
const applyTagFilter = async (
  filter: ContactFilter,
  params: ContactFilterParams,
  models: IModels,
) => {
  const { tagIds, excludeTagIds } = params;

  if (!(tagIds?.length || excludeTagIds?.length)) {
    return;
  }

  const resolvedTagIds = tagIds?.length
    ? await resolveTagIds(params, models, tagIds)
    : [];
  const resolvedExcludeTagIds = excludeTagIds?.length
    ? await resolveTagIds(params, models, excludeTagIds)
    : [];

  if (tagIds?.length && excludeTagIds?.length) {
    filter['tagIds'] = {
      $in: resolvedTagIds,
      $nin: resolvedExcludeTagIds,
    };
    return;
  }

  if (tagIds?.length) {
    filter['tagIds'] = { $in: resolvedTagIds };
    return;
  }

  if (excludeTagIds?.length) {
    filter['tagIds'] = { $nin: resolvedExcludeTagIds };
  }
};

/** Filters indexed segment memberships maintained by the segmentation worker. */
const applySegmentFilter = (
  filter: ContactFilter,
  params: ContactFilterParams,
) => {
  const { segmentIds } = params;

  // Membership is read off the record, not recomputed: the segmentation worker
  // maintains `segmentIds`, so filtering by segment is an indexed lookup rather
  // than a run of the whole definition.
  if (segmentIds?.length) {
    filter['segmentIds'] = { $in: segmentIds };
  }
};

/** Parses date filters and applies each supplied lower or upper bound. */
const applyDateRangeFilter = (
  filter: ContactFilter,
  params: ContactFilterParams,
) => {
  const { dateFilters } = params;

  if (!dateFilters) {
    return;
  }

  let dateFilter: Record<string, { gte?: string; lte?: string }>;

  try {
    dateFilter = JSON.parse(dateFilters);
  } catch (err) {
    throw new Error(`Invalid dateFilters JSON: ${err}`);
  }

  for (const [key, value] of Object.entries(dateFilter)) {
    const { gte, lte } = value || {};

    if (!(gte || lte)) {
      continue;
    }

    const range: Record<string, string> = {};

    if (gte) {
      range['$gte'] = gte;
    }

    if (lte) {
      range['$lte'] = lte;
    }

    filter[key] = range;
  }
};

/** Appends property conditions while preserving existing conjunctions. */
const applyPropertyFilter = (
  filter: ContactFilter,
  params: ContactFilterParams,
) => {
  const { propertiesData } = params;

  if (!propertiesData) {
    return;
  }

  const propertyConditions = buildPropertyFilter(propertiesData);

  if (propertyConditions.length) {
    const existingConditions = filter['$and'];
    const baseConditions = Array.isArray(existingConditions)
      ? existingConditions
      : [];
    filter['$and'] = [...baseConditions, ...propertyConditions];
  }
};

/** Combines tenant contact filters into a MongoDB query predicate. */
export const generateFilter = async (
  subdomain: string,
  params: ContactFilterParams,
  models: IModels,
  searchConfig?: ISearchTokenConfig,
) => {
  const filter: ContactFilter = {
    status: { $ne: CONTACT_STATUSES.deleted },
  };

  await applyBasicFilters(filter, params, models);
  applySearchFilter(filter, params, searchConfig);
  applyIdFilter(filter, params);
  await applyIntegrationFilter(filter, subdomain, params);
  await applyTagFilter(filter, params, models);
  applySegmentFilter(filter, params);
  applyDateRangeFilter(filter, params);
  applyPropertyFilter(filter, params);

  return filter;
};

/** Builds bulk inserts or updates while merging custom fields for imported contacts. */
export const createOrUpdate = async ({
  collection,
  data: { rows, doNotReplaceExistingValues },
}) => {
  const operations: mongo.AnyBulkWriteOperation[] = [];

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

      const newDoc = Object.fromEntries(
        Object.entries(doc).filter(
          ([fieldName]) =>
            !doNotReplaceExistingValues || !prevEntry[fieldName],
        ),
      );

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

/** Returns customer counts grouped by tag or integration brand. */
export const customersCount = async ({
  models,
  subdomain,
  type,
}: {
  models: IModels;
  subdomain: string;
  type: string;
}) => {
  const counts = {};

  switch (type) {
    case 'tag': {
      const tagIds = await models.Tags.find({ type: 'core:customer' }).distinct(
        '_id',
      );

      for (const tagId of tagIds) {
        counts[tagId] = await models.Customers.countDocuments({
          tagIds: tagId,
        });
      }

      break;
    }
    case 'brand': {
      const brandIds = await models.Brands.find({}).distinct('_id');

      const integrations = await findIntegrations(subdomain, {
        brandId: { $in: brandIds },
      });

      for (const integration of integrations) {
        if (!integration.brandId) {
          continue;
        }

        counts[integration.brandId] = await models.Customers.countDocuments({
          relatedIntegrationIds: integration._id,
        });
      }

      break;
    }
    default:
      break;
  }

  return counts;
};
