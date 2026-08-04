import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { getRealIdFromElk } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getCustomFields } from '~/modules/forms/utils';

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

  return customFields.map((field) => {
    const group = field.groupId ? groupById.get(String(field.groupId)) : null;
    const fieldId = getRealIdFromElk(String(field._id));
    const label = group?.name ? `${group.name} / ${field.name}` : field.name;
    const uniqueLabel = field.code ? `${label} [${field.code}]` : label;
    const key = `propertiesData.${fieldId}`;

    return {
      label: uniqueLabel,
      key,
      aliases: [
        label,
        field.name,
        field.code,
        field.code ? `${field.name} [${field.code}]` : '',
        key,
      ].filter(Boolean),
      type: 'customProperty',
    };
  });
};

export const extractPropertiesData = async (
  models: IModels,
  doc: Record<string, any>,
) => {
  const propertiesData: Record<string, any> = {};

  for (const key of Object.keys(doc)) {
    if (!key.startsWith('propertiesData.')) {
      continue;
    }

    const field = key.replace('propertiesData.', '');
    const value = doc[key];

    delete doc[key];

    if (value !== undefined && value !== null && value !== '') {
      propertiesData[field] = value;
    }
  }

  if (Object.keys(propertiesData).length) {
    doc.propertiesData = await models.Fields.validateFieldValues({
      ...(doc.propertiesData || {}),
      ...propertiesData,
    });
  }
};
