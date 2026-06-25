import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { generateSalesFields } from '~/modules/sales/fieldUtils';

const SALES_DOCUMENT_ATTRIBUTES = [
  { value: 'name', name: 'Name' },
  { value: 'createdAt', name: 'Created at' },
  { value: 'closeDate', name: 'Close date' },
  { value: 'description', name: 'Description' },
  { value: 'productsInfo', name: 'Products information' },
  { value: 'allProductsInfo', name: 'All items information (products + services)' },
  { value: 'productCategoryInfo', name: 'Products with category information' },
  { value: 'servicesInfo', name: 'Services information' },
  { value: 'assignedUsers', name: 'Assigned users' },
  { value: 'labels', name: 'Labels' },
  { value: 'stageName', name: 'Stage name' },
  { value: 'brandName', name: 'Brand name' },
  { value: 'customers', name: 'Customers' },
  { value: 'companies', name: 'Companies' },
  { value: 'now', name: 'Now' },
  { value: 'productTotalAmount', name: 'Products total amount' },
  { value: 'servicesTotalAmount', name: 'Services total amount' },
  { value: 'totalAmount', name: 'Total amount' },
  { value: 'totalAmountVat', name: 'Total amount vat' },
  { value: 'totalAmountAfterTaxVat', name: 'Total amount after tax and vat' },
  { value: 'totalAmountWithoutVat', name: 'Total amount without vat' },
  { value: 'discount', name: 'Discount' },
  { value: 'discountType', name: 'Discount Type' },
  { value: 'paymentCash', name: 'Payment cash' },
  { value: 'paymentNonCash', name: 'Payment non cash' },
  { value: 'customers.primaryPhone', name: 'customers.primaryPhone' },
  { value: 'customers.primaryEmail', name: 'customers.primaryEmail' },
];

type TEditorAttribute = {
  value: string;
  name: string;
  groupDetail?: unknown;
};

export const salesDocumentEditorAttributes = async (
  models: IModels,
  subdomain: string,
  contentType: string,
): Promise<TEditorAttribute[]> => {
  const dealFields = await generateSalesFields(subdomain, models, {
    moduleType: 'deal',
    collectionType: 'deals',
    usageType: 'document',
  });

  const schemaAttributes: TEditorAttribute[] = (dealFields || []).map(
    (field: any) => ({
      value: field.name,
      name: `deal:${field.label || field.name}`,
      groupDetail: field.group,
    }),
  );

  const customFields = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: { contentType: contentType || 'sales:deal' },
    },
    defaultValue: [],
  });

  const customFieldAttributes: TEditorAttribute[] = (customFields || []).map(
    (field: any) => ({
      value: `customFieldsData.${field._id}`,
      name: `deal:${field.name || field.text || field.label || field._id}`,
    }),
  );

  return [
    ...SALES_DOCUMENT_ATTRIBUTES,
    ...schemaAttributes,
    ...customFieldAttributes,
  ];
};

export const documents = {
  types: [
    {
      label: 'Sales',
      contentType: 'sales:deal',
    },
  ],
};
