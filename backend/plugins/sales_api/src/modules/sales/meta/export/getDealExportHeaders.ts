import {
  IImportExportContext,
  ImportHeaderDefinition,
  propertyDataPath,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { parseExportHeaders } from '~/meta/export/utils';

const DEAL_PROPERTY_CONTENT_TYPE = 'sales:deal';

/** Cap on how many rows of one repeating property group become columns. */
const MAX_PROPERTY_ROWS = 20;

interface IDealPropertyField {
  _id: string;
  name?: string;
  code?: string;
  groupId?: string;
}

export const DEAL_EXPORT_SYSTEM_HEADERS = parseExportHeaders(`
  number            | Number              | default
  name              | Name                | default
  boardName         | Board
  pipelineName      | Pipeline            | default
  stageName         | Stage               | default
  status            | Status
  priority          | Priority
  labels            | Labels
  tags              | Tags
  customer          | Customer            | default
  customerEmail     | Customer Email
  customerPhone     | Customer Phone
  company           | Company             | default
  createdBy         | Created By
  assignedUsers     | Assigned Users      | default
  branches          | Branches
  departments       | Departments
  startDate         | Start Date
  closeDate         | Close Date          | default
  stageChangedDate  | Stage Changed Date
  isComplete        | Is Complete
  products          | Products
  productCount      | Product Count
  productCode       | Product Code       | default
  productName       | Product Name       | default
  productQuantity   | Quantity           | default
  productUnitPrice  | Unit Price
  productDiscount   | Discount           | default
  productAmount     | Amount             | default
  currency          | Currency
  totalAmount       | Total Amount        | default
  unUsedTotalAmount | Unused Total Amount
  paidAmount        | Paid Amount
  payments          | Payments
  description       | Description
  score             | Score
  createdAt         | Created At          | default
  updatedAt         | Updated At
`);

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
/** One column per live `sales:deal` property; stored repeating groups get numbered columns. */
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
/** Deal export columns: fixed system fields followed by deal properties. */
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
