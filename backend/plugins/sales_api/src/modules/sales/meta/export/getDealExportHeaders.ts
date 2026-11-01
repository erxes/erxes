import {
  IImportExportContext,
  ImportHeaderDefinition,
  propertyDataPath,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

const DEAL_PROPERTY_CONTENT_TYPE = 'sales:deal';

/** Cap on how many rows of one repeating property group become columns. */
const MAX_PROPERTY_ROWS = 20;

interface IDealPropertyField {
  _id: string;
  name?: string;
  code?: string;
  groupId?: string;
}

export const DEAL_EXPORT_SYSTEM_HEADERS: ImportHeaderDefinition[] = [
  { label: 'Number', key: 'number', isDefault: true },
  { label: 'Name', key: 'name', isDefault: true },
  { label: 'Board', key: 'boardName' },
  { label: 'Pipeline', key: 'pipelineName', isDefault: true },
  { label: 'Stage', key: 'stageName', isDefault: true },
  { label: 'Status', key: 'status' },
  { label: 'Priority', key: 'priority' },
  { label: 'Labels', key: 'labels' },
  { label: 'Tags', key: 'tags' },
  { label: 'Customer', key: 'customer', isDefault: true },
  { label: 'Customer Email', key: 'customerEmail' },
  { label: 'Customer Phone', key: 'customerPhone' },
  { label: 'Company', key: 'company', isDefault: true },
  { label: 'Created By', key: 'createdBy' },
  { label: 'Assigned Users', key: 'assignedUsers', isDefault: true },
  { label: 'Branches', key: 'branches' },
  { label: 'Departments', key: 'departments' },
  { label: 'Start Date', key: 'startDate' },
  { label: 'Close Date', key: 'closeDate', isDefault: true },
  { label: 'Stage Changed Date', key: 'stageChangedDate' },
  { label: 'Is Complete', key: 'isComplete' },
  { label: 'Products', key: 'products' },
  { label: 'Product Count', key: 'productCount' },
  { label: 'Currency', key: 'currency' },
  { label: 'Total Amount', key: 'totalAmount', isDefault: true },
  { label: 'Unused Total Amount', key: 'unUsedTotalAmount' },
  { label: 'Paid Amount', key: 'paidAmount' },
  { label: 'Payments', key: 'payments' },
  { label: 'Description', key: 'description' },
  { label: 'Score', key: 'score' },
  { label: 'Created At', key: 'createdAt', isDefault: true },
  { label: 'Updated At', key: 'updatedAt' },
];

/**
 * Core does not expose field groups to plugins, so a group counts as
 * repeating when deals already store it as rows. Each row becomes a column.
 */
const countStoredPropertyRows = async (
  models: IModels,
  groupId: string,
): Promise<number> => {
  const path = propertyDataPath(toPropertyGroupKey(groupId));

  const [largest] = await models.Deals.aggregate<{ size: number }>([
    { $match: { [path]: { $type: 'array' } } },
    { $project: { size: { $size: `$${path}` } } },
    { $sort: { size: -1 } },
    { $limit: 1 },
  ]);

  return Math.min(Number(largest?.size) || 0, MAX_PROPERTY_ROWS);
};

const getDealPropertyHeaders = async (
  subdomain: string,
  models: IModels,
): Promise<ImportHeaderDefinition[]> => {
  const fields: IDealPropertyField[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType: DEAL_PROPERTY_CONTENT_TYPE },
      projection: { _id: 1, name: 1, code: 1, groupId: 1 },
      sort: { order: 1 },
    },
    defaultValue: [],
  });

  if (!Array.isArray(fields) || !fields.length) {
    return [];
  }

  const groupIds = [
    ...new Set(fields.map(({ groupId }) => groupId).filter(Boolean)),
  ] as string[];

  const rowCounts = new Map<string, number>();
  for (const groupId of groupIds) {
    rowCounts.set(groupId, await countStoredPropertyRows(models, groupId));
  }

  return fields.flatMap((field): ImportHeaderDefinition[] => {
    const fieldId = String(field._id);
    const name = field.name || field.code || fieldId;
    const label = field.code ? `${name} [${field.code}]` : name;
    const rows = field.groupId ? rowCounts.get(field.groupId) || 0 : 0;

    if (rows > 0 && field.groupId) {
      const groupId = field.groupId;

      return Array.from({ length: rows }, (_, offset) => ({
        label: `${label} #${offset + 1}`,
        key: toPropertyRowColumnKey(groupId, fieldId, offset + 1),
        type: 'customProperty',
        code: field.code || undefined,
        rowIndex: offset + 1,
      }));
    }

    return [
      {
        label,
        key: propertyDataPath(fieldId),
        type: 'customProperty',
        code: field.code || undefined,
      },
    ];
  });
};

export async function getDealExportHeaders(
  _args: unknown,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  if (!models) {
    return DEAL_EXPORT_SYSTEM_HEADERS;
  }

  const propertyHeaders = await getDealPropertyHeaders(subdomain, models);

  return [...DEAL_EXPORT_SYSTEM_HEADERS, ...propertyHeaders];
}
