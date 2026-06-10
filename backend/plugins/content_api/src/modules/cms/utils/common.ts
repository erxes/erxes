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
    module: 'fields',
    action: 'findOne',
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
  const safeCustomFieldsData = Array.isArray(customFieldsData)
    ? customFieldsData
    : [];

  if (fieldGroups.length > 0) {
    for (const fieldGroup of fieldGroups) {
      let fields: any[] = [];

      if (Array.isArray(fieldGroup?.fields)) {
        fields = fieldGroup.fields;
      } else if (typeof fieldGroup?.fields === 'string') {
        try {
          const parsed = JSON.parse(fieldGroup.fields);
          fields = Array.isArray(parsed) ? parsed : [];
        } catch {
          fields = [];
        }
      }

      if (!fields.length) {
        fields = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'fields',
          action: 'find',
          input: { query: { groupId: fieldGroup._id } },
        });
      }

      jsonMap[fieldGroup.code] = fields.reduce((acc, field: any) => {
        const value = safeCustomFieldsData.find(
          (c: any) => c.field === field._id,
        );
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
  const customFieldsData = object.customFieldsData?.toObject
    ? object.customFieldsData.toObject()
    : object.customFieldsData || [];

  const fieldIds = customFieldsData.map((data) => data.field);

  const fields = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
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

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/**
 * Build a URL-safe slug from a post title. Mongolian Cyrillic characters are
 * transliterated to Latin, the rest is normalized to `[a-z0-9-]`, and the
 * result is capped at `maxLength` characters without breaking the final word.
 */
export const createSlug = (title: string, maxLength = 60): string => {
  let slug = String(title ?? '')
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Cut to maxLength without breaking the last word when possible.
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    const lastDash = slug.lastIndexOf('-');
    if (lastDash > 0) {
      slug = slug.slice(0, lastDash);
    }
    slug = slug.replace(/-+$/, '');
  }

  return slug;
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
  cpId: string,
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
    clientPortalId: cpId,
    _id: { $ne: excludeId },
  });

  if (!existingTag) {
    return potentialSlug;
  }

  // If slug exists, try with next increment number
  return generateUniqueSlugWithExclusion(
    model,
    cpId,
    field,
    baseSlug,
    excludeId,
    count + 1,
  );
};
