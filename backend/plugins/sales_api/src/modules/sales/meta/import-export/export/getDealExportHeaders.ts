import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const PRODUCT_FIELD_HEADERS: ImportHeaderDefinition[] = [
  { label: 'Product Name', key: 'productsData.name' },
  { label: 'Product Code', key: 'productsData.code' },
  { label: 'Product Amount', key: 'productsData.amount' },
  { label: 'Product Discount', key: 'productsData.discount' },
  { label: 'Product Discount Percent', key: 'productsData.discountPercent' },
  { label: 'Product Currency', key: 'productsData.currency' },
  { label: 'Product Tax', key: 'productsData.tax' },
  { label: 'Product Tax Percent', key: 'productsData.taxPercent' },
  { label: 'Product Quantity', key: 'productsData.quantity' },
  { label: 'Product Unit Price', key: 'productsData.unitPrice' },
  { label: 'Product Tick Used', key: 'productsData.tickUsed' },
  { label: 'Product VAT Applied', key: 'productsData.isVatApplied' },
  { label: 'Product Branch', key: 'productsData.branch' },
  { label: 'Product Department', key: 'productsData.department' },
  { label: 'Product Max Quantity', key: 'productsData.maxQuantity' },
];

export async function getDealExportHeaders(
  _data: unknown,
  { subdomain }: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  const customFields = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType: 'sales:deal' },
      projection: { _id: 1, text: 1 },
      sort: { order: 1 },
    },
  });

  if (customFields !== undefined && !Array.isArray(customFields)) {
    throw new Error('Custom field lookup returned an invalid response');
  }

  const systemFields: ImportHeaderDefinition[] = [
    { label: 'ID', key: '_id' },
    { label: 'Number', key: 'number', isDefault: true },
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Board', key: 'boardName' },
    { label: 'Pipeline', key: 'pipeline', isDefault: true },
    { label: 'Pipeline Name', key: 'pipelineName' },
    { label: 'Stage', key: 'stage', isDefault: true },
    { label: 'Stage Name', key: 'stageName' },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Priority', key: 'priority', isDefault: true },
    { label: 'Total Amount', key: 'totalAmount', isDefault: true },
    { label: 'Unused Total Amount', key: 'unUsedTotalAmount' },
    { label: 'Both Total Amount', key: 'bothTotalAmount' },
    { label: 'Description', key: 'description' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Close Date', key: 'closeDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt', isDefault: true },
    { label: 'Modified At', key: 'modifiedAt' },
    { label: 'Stage ID', key: 'stageId' },
    { label: 'Pipeline ID', key: 'pipelineId' },
    { label: 'Board ID', key: 'boardId' },
    { label: 'Initial Stage', key: 'initialStage' },
    { label: 'Initial Stage ID', key: 'initialStageId' },
    { label: 'Watched Users', key: 'watchedUsers' },
    { label: 'Watched User IDs', key: 'watchedUserIds' },
    { label: 'Assigned Users', key: 'assignedUsers' },
    { label: 'Assigned User IDs', key: 'assignedUserIds' },
    { label: 'Owner', key: 'owner' },
    { label: 'Owner ID', key: 'userId' },
    { label: 'Modified By', key: 'modifiedBy' },
    { label: 'Customers', key: 'customers' },
    { label: 'Customer Emails', key: 'customersEmail' },
    { label: 'Customer Names', key: 'customersName' },
    { label: 'Customer Phones', key: 'customersPhone' },
    { label: 'Customer IDs', key: 'customerIds' },
    { label: 'Companies', key: 'companies' },
    { label: 'Company IDs', key: 'companyIds' },
    { label: 'Labels', key: 'labels' },
    { label: 'Label IDs', key: 'labelIds' },
    { label: 'Tags', key: 'tags' },
    { label: 'Tag IDs', key: 'tagIds' },
    { label: 'Branches', key: 'branches' },
    { label: 'Branch IDs', key: 'branchIds' },
    { label: 'Departments', key: 'departments' },
    { label: 'Department IDs', key: 'departmentIds' },
    { label: 'Products', key: 'products' },
    { label: 'Products JSON', key: 'productsData' },
    { label: 'Total Label Count', key: 'totalLabelCount' },
  ];

  const customFieldHeaders: ImportHeaderDefinition[] = (customFields || []).map(
    (field: any) => ({
      label: field.text || field._id,
      key: `customFieldsData.${field._id}`,
      type: 'customProperty',
    }),
  );

  return [...systemFields, ...PRODUCT_FIELD_HEADERS, ...customFieldHeaders];
}
