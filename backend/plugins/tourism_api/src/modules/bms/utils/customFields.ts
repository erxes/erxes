import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const generateUniqueSlug = async (
  model: any,
  branchId: string,
  field: string,
  baseSlug: string,
  count?: number,
): Promise<string> => {
  if (!count) {
    count = 1;
  }

  const potentialSlug = count === 1 ? baseSlug : `${baseSlug}_${count}`;

  const existing = await model.findOne({
    [field]: potentialSlug,
    branchId,
  });

  if (!existing) {
    return potentialSlug;
  }

  return generateUniqueSlug(model, branchId, field, baseSlug, count + 1);
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
          (customField: any) => customField.field === field._id,
        );
        acc[field.code] = value ? value.value : null;
        return acc;
      }, {});
    }
  }

  return jsonMap;
};
