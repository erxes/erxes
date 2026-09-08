import {
  collectPropertyDataFromColumns,
  propertyDataPath,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from 'erxes-api-shared/core-modules';
import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getCustomFields } from '~/modules/forms/utils';

const MAX_ROW_COLUMNS = 20;

const COLLECTION_BY_CONTENT_TYPE: Record<string, keyof IModels> = {
  'core:customer': 'Customers',
  'core:company': 'Companies',
  'core:product': 'Products',
  'core:user': 'Users',
};

const countRepeatingGroupRows = async (
  models: IModels,
  contentType: string,
  groupIds: string[],
): Promise<Map<string, number>> => {
  const counts = new Map(groupIds.map((groupId) => [groupId, 1]));
  const modelName = COLLECTION_BY_CONTENT_TYPE[contentType];

  if (!modelName || !groupIds.length) {
    return counts;
  }

  const collection = models[modelName] as unknown as Model<unknown>;

  for (const groupId of groupIds) {
    const path = propertyDataPath(toPropertyGroupKey(groupId));

    const [largest] = await collection
      .aggregate([
        { $match: { [path]: { $type: 'array' } } },
        { $project: { size: { $size: `$${path}` } } },
        { $sort: { size: -1 } },
        { $limit: 1 },
      ])
      .exec();

    counts.set(
      groupId,
      Math.min(Math.max(Number(largest?.size) || 1, 1), MAX_ROW_COLUMNS),
    );
  }

  return counts;
};

export const getCustomPropertyHeaders = async (
  models: IModels,
  contentType?: string,
): Promise<ImportHeaderDefinition[]> => {
  if (!contentType) {
    return [];
  }

  const customFields = await getCustomFields(models, contentType);
  const groupIds = customFields
    .map((field) => field.groupId)
    .filter(Boolean)
    .map(String);

  const groups = groupIds.length
    ? await models.FieldsGroups.find({ _id: { $in: groupIds } }).lean()
    : [];
  const groupById = new Map(groups.map((group) => [String(group._id), group]));

  const rowCounts = await countRepeatingGroupRows(
    models,
    contentType,
    groups
      .filter((group) => group.configs?.isMultiple)
      .map((group) => String(group._id)),
  );

  return customFields.flatMap((field) => {
    const group = field.groupId ? groupById.get(String(field.groupId)) : null;
    const fieldId = String(field._id);
    const groupId = group ? String(group._id) : '';

    const buildHeader = (
      label: string,
      key: string,
    ): ImportHeaderDefinition => ({
      label: field.code ? `${label} [${field.code}]` : label,
      key,
      aliases: [
        label,
        field.name,
        field.code,
        field.code ? `${field.name} [${field.code}]` : '',
        key,
      ].filter(Boolean),
      type: 'customProperty',
    });

    if (group?.configs?.isMultiple) {
      const rows = rowCounts.get(groupId) || 1;

      return Array.from({ length: rows }, (_, offset) =>
        buildHeader(
          `${group.name} ${offset + 1} / ${field.name}`,
          toPropertyRowColumnKey(groupId, fieldId, offset + 1),
        ),
      );
    }

    return [
      buildHeader(
        group?.name ? `${group.name} / ${field.name}` : field.name,
        propertyDataPath(fieldId),
      ),
    ];
  });
};

export const extractPropertiesData = async (
  models: IModels,
  doc: Record<string, any>,
) => {
  const propertiesData = collectPropertyDataFromColumns(doc);

  if (Object.keys(propertiesData).length) {
    doc.propertiesData = await models.Fields.validateFieldValues({
      ...(doc.propertiesData || {}),
      ...propertiesData,
    });
  }
};
