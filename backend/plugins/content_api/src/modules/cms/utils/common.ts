import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getConfig = async (
  subdomain: string,
  code: string,
  defaultValue?: string,
) => {
  const configs = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'core',
    action: 'getConfigs',
    input: {},
    defaultValue: [],
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const buildCustomFieldsMap = async (
  subdomain: string,
  fieldGroups: any[],
  customFieldsData: any,
) => {
  const jsonMap: any = {};

  if (fieldGroups.length > 0) {
    for (const fieldGroup of fieldGroups) {
      const fields = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'core',
        action: 'fields.find',
        input: { query: { groupId: fieldGroup._id } },
      });

      jsonMap[fieldGroup.code] = fields.reduce((acc, field: any) => {
        const value = customFieldsData.find((c: any) => c.field === field._id);
        acc[field.code] = value ? value.value : null;
        return acc;
      }, {});
    }
  }

  return jsonMap;
};

export const customFieldsDataByFieldCode = async (
  subdomain: string,
  object,
) => {
  const customFieldsData =
    object.customFieldsData && object.customFieldsData.toObject
      ? object.customFieldsData.toObject()
      : object.customFieldsData || [];

  const fieldIds = customFieldsData.map((data) => data.field);

  const fields = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'core',
    action: 'fields.find',
    input: { query: { _id: { $in: fieldIds } } },
  });

  const fieldCodesById = {};

  for (const field of fields) {
    fieldCodesById[field._id] = field.code;
  }

  const results: any = {};

  for (const data of customFieldsData) {
    results[fieldCodesById[data.field]] = {
      ...data,
    };
  }

  return results;
};

export const generateUniqueSlug = async (
  model: any,
  cpId: string,
  field: string,
  baseSlug: string,
  count?: number,
): Promise<string> => {
  if (!count) {
    count = 1;
  }

  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}_${count}`;

  // Check if slug already exists
  const existing = await model.findOne({
    [field]: potentialSlug,
    clientPortalId: cpId,
  });

  if (!existing) {
    return potentialSlug;
  }

  // If slug exists, try with next increment number
  return generateUniqueSlug(model, cpId, field, baseSlug, count + 1);
};

/**
 * Generate unique slug excluding a specific document (for updates)
 */
export const generateUniqueSlugWithExclusion = async (
  model: any,
  field: string,
  baseSlug: string,
  excludeId: string,
  count: number,
): Promise<string> => {
  if (!count) {
    count = 1;
  }

  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}_${count}`;

  // Check if slug already exists excluding current document
  const existingTag = await model.findOne({
    [field]: potentialSlug,
    _id: { $ne: excludeId },
  });

  if (!existingTag) {
    return potentialSlug;
  }

  // If slug exists, try with next increment number
  return generateUniqueSlugWithExclusion(
    model,
    field,
    baseSlug,
    excludeId,
    count + 1,
  );
};
