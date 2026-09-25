import {
  collectPropertyDataFromColumns,
  ImportHeaderDefinition,
  propertyDataPath,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const TICKET_CONTENT_TYPE = 'frontline:ticket';

const MAX_ROW_COLUMNS = 20;

const countRepeatingGroupRows = async (
  models: IModels | undefined,
  groupIds: string[],
): Promise<Map<string, number>> => {
  const counts = new Map(groupIds.map((groupId) => [groupId, 1]));

  if (!models?.Ticket || !groupIds.length) {
    return counts;
  }

  for (const groupId of groupIds) {
    const path = propertyDataPath(toPropertyGroupKey(groupId));

    const [largest] = await models.Ticket.aggregate([
      { $match: { [path]: { $type: 'array' } } },
      { $project: { size: { $size: `$${path}` } } },
      { $sort: { size: -1 } },
      { $limit: 1 },
    ]);

    counts.set(
      groupId,
      Math.min(Math.max(Number(largest?.size) || 1, 1), MAX_ROW_COLUMNS),
    );
  }

  return counts;
};

export const getTicketCustomPropertyHeaders = async (
  subdomain: string,
  models?: IModels,
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

  const rowCounts = await countRepeatingGroupRows(
    models,
    groups
      .filter((group) => group.configs?.isMultiple)
      .map((group) => String(group._id)),
  );

  return fields.flatMap((field) => {
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
      type: 'customProperty' as const,
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

export const extractTicketPropertiesData = async (
  subdomain: string,
  doc: Record<string, any>,
): Promise<void> => {
  const propertiesData = collectPropertyDataFromColumns(doc);

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
