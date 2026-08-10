import { ImportHeaderDefinition } from 'erxes-api-shared/core-modules';
import { getRealIdFromElk, sendTRPCMessage } from 'erxes-api-shared/utils';

export const TICKET_CONTENT_TYPE = 'frontline:ticket';

export const getTicketCustomPropertyHeaders = async (
  subdomain: string,
): Promise<ImportHeaderDefinition[]> => {
  const fields: any[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType: TICKET_CONTENT_TYPE },
      projection: null,
      sort: { order: 1 },
    },
    defaultValue: [],
  });

  if (!fields?.length) return [];

  const groupIds = fields
    .map((f) => f.groupId)
    .filter(Boolean)
    .map(String);

  const groups: any[] = groupIds.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'fieldsGroups',
        action: 'find',
        input: { query: { _id: { $in: groupIds } } },
        defaultValue: [],
      })
    : [];

  const groupById = new Map(groups.map((g) => [String(g._id), g]));

  return fields.map((field) => {
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
      type: 'customProperty' as const,
    };
  });
};

export const extractTicketPropertiesData = async (
  subdomain: string,
  doc: Record<string, any>,
): Promise<void> => {
  const propertiesData: Record<string, any> = {};

  for (const key of Object.keys(doc)) {
    if (!key.startsWith('propertiesData.')) continue;

    const fieldId = key.replace('propertiesData.', '');
    const value = doc[key];
    delete doc[key];

    if (value !== undefined && value !== null && value !== '') {
      propertiesData[fieldId] = value;
    }
  }

  if (!Object.keys(propertiesData).length) return;

  const merged = { ...(doc.propertiesData || {}), ...propertiesData };

  doc.propertiesData = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action: 'validateFieldValues',
    input: { data: merged },
    defaultValue: merged,
  });
};
