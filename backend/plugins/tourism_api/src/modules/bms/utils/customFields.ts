import { sendTRPCMessage } from 'erxes-api-shared/utils';

const slugify = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'custom';

export const generateUniqueSlug = async (
  model: any,
  branchId: string,
  field: string,
  baseSlug: string,
  count = 1,
): Promise<string> => {
  const normalizedBase = slugify(baseSlug);
  const potentialSlug =
    count === 1 ? normalizedBase : `${normalizedBase}_${count}`;

  const existing = await model.findOne({
    [field]: potentialSlug,
    branchId,
  });

  if (!existing) {
    return potentialSlug;
  }

  return generateUniqueSlug(model, branchId, field, normalizedBase, count + 1);
};

export const buildCustomFieldsMap = async (
  subdomain: string,
  fieldGroups: any[],
  customFieldsData: any,
) => {
  const jsonMap: Record<string, Record<string, unknown>> = {};
  const safeCustomFieldsData = Array.isArray(customFieldsData)
    ? customFieldsData
    : [];

  for (const fieldGroup of fieldGroups || []) {
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
        defaultValue: [],
      });
    }

    const groupKey = fieldGroup.code || fieldGroup._id;

    jsonMap[groupKey] = fields.reduce(
      (acc: Record<string, unknown>, field: any) => {
        const value = safeCustomFieldsData.find(
          (customField: any) => customField.field === field._id,
        );
        acc[field.code || field._id] = value ? value.value : null;
        return acc;
      },
      {},
    );
  }

  return jsonMap;
};
