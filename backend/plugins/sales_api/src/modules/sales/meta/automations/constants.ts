import {
  TAutomationFindObjectTargetDefinition,
  TAutomationRuntimeOutputDefinition,
  TAutomationSetPropertyTarget,
  TAutomationTriggerActionInputs,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { generateTotalAmount } from './action/generateTotalAmount';
import {
  dealPaidAmount,
  dealPurchaseItems,
  LOYALTY_ADJUST_SCORE_ACTION,
} from './purchase';
import { IDeal, IProductData } from '../../@types';
import { buildDealAmountAttributes } from '../../documents/dealContent';
import { generateProducts } from '../../utils';

type TAutomationProductData = IProductData & { maxQuantity?: number };

const PRODUCTS_DATA_FIELD_RESOLVERS: Record<
  string,
  (product: TAutomationProductData) => unknown
> = {
  _id: (product) => product._id,
  productId: (product) => product.productId,
  uom: (product) => product.uom,
  currency: (product) => product.currency,
  quantity: (product) => product.quantity,
  maxQuantity: (product) => product.maxQuantity,
  unitPrice: (product) => product.unitPrice,
  globalUnitPrice: (product) => product.globalUnitPrice,
  unitPricePercent: (product) => product.unitPricePercent,
  taxPercent: (product) => product.taxPercent,
  tax: (product) => product.tax,
  vatPercent: (product) => product.vatPercent,
  discountPercent: (product) => product.discountPercent,
  discount: (product) => product.discount,
  bonusCount: (product) => product.bonusCount,
  amount: (product) => product.amount,
  tickUsed: (product) => product.tickUsed,
  isVatApplied: (product) => product.isVatApplied,
  assignUserId: (product) => product.assignUserId,
  branch: (product) => product.branchId,
  branchId: (product) => product.branchId,
  department: (product) => product.departmentId,
  departmentId: (product) => product.departmentId,
  startDate: (product) => product.startDate,
  endDate: (product) => product.endDate,
  parentId: (product) => product.parentId,
  information: (product) => product.information,
  extraIds: (product) => product.extraIds,
};

const formatProductsDataValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : undefined;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const joinProductsDataValues = (values: unknown[]) => {
  const formattedValues = values
    .map(formatProductsDataValue)
    .filter((value): value is string => Boolean(value));

  return formattedValues.length ? formattedValues.join(', ') : undefined;
};

/**
 * Deal products data stores only productId (name is rarely denormalized), so
 * resolve product names via a core lookup for the ones that miss it.
 */
const resolveProductsDataNames = async (subdomain: string, source: IDeal) => {
  const productsData = source.productsData || [];

  if (!productsData.length) {
    return undefined;
  }

  const namesByProductId = new Map<string, string>();
  const missingIds = productsData
    .filter((item) => !item.name && item.productId)
    .map((item) => item.productId);

  if (missingIds.length) {
    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: missingIds } },
        fields: { _id: 1, name: 1 },
      },
      defaultValue: [],
    });

    for (const product of Array.isArray(products) ? products : []) {
      namesByProductId.set(product._id, product.name);
    }
  }

  const names = productsData
    .map((item) => item.name || namesByProductId.get(item.productId))
    .filter(Boolean);

  return names.length ? names.join(', ') : undefined;
};

const resolveProductsDataPath = (
  subdomain: string,
  source: IDeal,
  path: string,
) => {
  const productsData: TAutomationProductData[] = source.productsData || [];
  const field = path.replace(/^productsData\./, '');

  if (!field) {
    return resolveProductsDataNames(subdomain, source);
  }

  if (field === 'name') {
    return resolveProductsDataNames(subdomain, source);
  }

  const fieldResolver = PRODUCTS_DATA_FIELD_RESOLVERS[field];

  if (!fieldResolver) {
    return undefined;
  }

  return joinProductsDataValues(productsData.map(fieldResolver));
};

const DEAL_DOCUMENT_AMOUNT_VARIABLES = [
  { key: 'productTotalAmount', label: 'Products total amount' },
  { key: 'servicesTotalAmount', label: 'Services total amount' },
  { key: 'totalAmountVat', label: 'Total amount vat' },
  { key: 'totalAmountAfterTaxVat', label: 'Total amount after tax and vat' },
  { key: 'totalAmountWithoutVat', label: 'Total amount without vat' },
  { key: 'discount', label: 'Discount' },
  { key: 'discountType', label: 'Discount type' },
  { key: 'paymentCash', label: 'Payment cash' },
  { key: 'paymentNonCash', label: 'Payment non cash' },
];

// Only the product/service split needs each product's type from core.
const PRODUCT_TYPE_AMOUNT_KEYS = ['productTotalAmount', 'servicesTotalAmount'];

/**
 * The same amounts the sales document prints, formatted the same way, so an
 * automation fills them exactly as the document does.
 */
const resolveDealDocumentAmount = async (
  subdomain: string,
  source: IDeal,
  key: string,
) => {
  const productsData = source.productsData || [];
  const items = PRODUCT_TYPE_AMOUNT_KEYS.includes(key)
    ? await generateProducts(subdomain, productsData)
    : productsData;

  return buildDealAmountAttributes(items, source.paymentsData)[key];
};

const DEAL_DOCUMENT_AMOUNT_RESOLVERS = Object.fromEntries(
  DEAL_DOCUMENT_AMOUNT_VARIABLES.map(({ key }) => [
    key,
    ({ subdomain, source }: { subdomain: string; source: IDeal }) =>
      resolveDealDocumentAmount(subdomain, source, key),
  ]),
);

export const SALES_DEAL_FIND_OBJECT_TYPE = 'sales:sales.deals';

const SALES_DEAL_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Deal',
    type: 'sales:sales.deals',
    source: 'target',
    cardinality: 'one',
  },
  {
    label: 'Deal customers',
    type: 'core:contacts.customers',
    source: 'relation',
    cardinality: 'many',
    relation: {
      contentType: 'sales:deal',
      relatedContentType: 'core:customer',
    },
  },
  {
    label: 'Deal companies',
    type: 'core:contacts.companies',
    source: 'relation',
    cardinality: 'many',
    relation: {
      contentType: 'sales:deal',
      relatedContentType: 'core:company',
    },
  },
];

const SALES_DEAL_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition<IDeal> = {
  variables: [
    { key: '_id', label: 'Deal ID', field: '_id' },
    { key: 'name', label: 'Deal name' },
    { key: 'number', label: 'Deal number' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'score', label: 'Score' },
    {
      key: 'stageId',
      label: 'Stage ID',
      exposure: 'reference',
      field: 'stageId',
      referenceType: 'sales:sales.stage',
    },
    {
      key: 'previousStageId',
      label: 'Previous stage ID',
      exposure: 'reference',
      field: 'previousStageId',
      referenceType: 'sales:sales.stage',
    },
    {
      key: 'currentStageId',
      label: 'Current stage ID',
      exposure: 'reference',
      field: 'currentStageId',
      referenceType: 'sales:sales.stage',
    },
    {
      key: 'initialStageId',
      label: 'Initial stage ID',
      exposure: 'reference',
      field: 'initialStageId',
      referenceType: 'sales:sales.stage',
    },
    { key: 'stageChangedDate', label: 'Stage changed date' },
    { key: 'startDate', label: 'Start date' },
    { key: 'closeDate', label: 'Close date' },
    { key: 'totalAmount', label: 'Total amount' },
    { key: 'unUsedTotalAmount', label: 'Unused total amount' },
    { key: 'bothTotalAmount', label: 'Both total amount' },
    ...DEAL_DOCUMENT_AMOUNT_VARIABLES,
    {
      key: 'userId',
      label: 'Created by',
      exposure: 'reference',
      field: 'userId',
      referenceType: 'core:user',
    },
    {
      key: 'assignedUserIds',
      label: 'Assigned users',
      exposure: 'reference',
      field: 'assignedUserIds',
      referenceType: 'core:user',
    },
    {
      key: 'watchedUserIds',
      label: 'Watched users',
      exposure: 'reference',
      field: 'watchedUserIds',
      referenceType: 'core:user',
    },
    {
      key: 'labelIds',
      label: 'Labels',
      exposure: 'reference',
      field: 'labelIds',
    },
    { key: 'tagIds', label: 'Tags', exposure: 'reference', field: 'tagIds' },
    {
      key: 'branchIds',
      label: 'Branches',
      exposure: 'reference',
      field: 'branchIds',
    },
    {
      key: 'departmentIds',
      label: 'Departments',
      exposure: 'reference',
      field: 'departmentIds',
    },
    {
      key: 'customers',
      label: 'Customers',
      exposure: 'reference',
      field: 'customers',
      referenceType: 'core:customer',
    },
    {
      key: 'companies',
      label: 'Companies',
      exposure: 'reference',
      field: 'companies',
      referenceType: 'core:company',
    },
    {
      key: 'productsData',
      label: 'Products',
      fields: [
        { key: 'name', label: 'Product name' },
        { key: 'quantity', label: 'Product quantity' },
        { key: 'unitPrice', label: 'Product unit price' },
        { key: 'amount', label: 'Product amount' },
        { key: 'discount', label: 'Product discount' },
        { key: 'tax', label: 'Product tax' },
        { key: 'currency', label: 'Currency' },
        { key: 'uom', label: 'Unit of measure' },
      ],
    },
    { key: 'paidAmount', label: 'Paid amount (without points)' },
    {
      key: 'purchaseItems',
      label: 'Purchased items',
      fields: [
        { key: 'productId', label: 'Product ID' },
        { key: 'amount', label: 'Amount' },
        { key: 'discounted', label: 'Discounted' },
      ],
    },
    { key: 'link', label: 'Deal link' },
    { key: 'pipelineLabels', label: 'Pipeline labels' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
  ],
  propertySource: {
    key: 'properties',
    label: 'Deal properties',
    propertyType: 'sales:deal',
  },
  resolvers: {
    ...DEAL_DOCUMENT_AMOUNT_RESOLVERS,
    productsData: ({ subdomain, source }) =>
      resolveProductsDataNames(subdomain, source),
    'productsData.*': ({ subdomain, source, path }) =>
      resolveProductsDataPath(subdomain, source, path),
    totalAmount: ({ source }) => generateTotalAmount(source.productsData),
    paidAmount: async ({ subdomain, source }) =>
      dealPaidAmount(await generateModels(subdomain), source),
    purchaseItems: ({ source }) => dealPurchaseItems(source),
    unUsedTotalAmount: ({ source }) => {
      let totalAmount = 0;

      (source.productsData || []).forEach((product) => {
        if (product.tickUsed) {
          totalAmount += product?.amount || 0;
        }
      });

      return totalAmount;
    },
    bothTotalAmount: ({ source }) => {
      let totalAmount = 0;

      (source.productsData || []).forEach((product) => {
        totalAmount += product?.amount || 0;
      });

      return totalAmount;
    },
  },
};

const SALES_FIND_OBJECT_TARGETS: TAutomationFindObjectTargetDefinition[] = [
  {
    value: SALES_DEAL_FIND_OBJECT_TYPE,
    label: 'Deal',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'number', label: 'Number' },
    ],
    output: SALES_DEAL_TRIGGER_OUTPUT,
  },
];

// A deal handed to loyalty as a purchase: the ticked products are what was
// bought, and point payments are not money paid.
const DEAL_ACTION_INPUTS: TAutomationTriggerActionInputs = {
  [LOYALTY_ADJUST_SCORE_ACTION]: {
    totalAmount: 'unUsedTotalAmount',
    paidAmount: 'paidAmount',
    items: 'purchaseItems',
  },
};

export const salesAutomationContants = {
  triggers: [
    {
      moduleName: 'sales',
      collectionName: 'deals',
      icon: 'IconPigMoney',
      label: 'Sales pipeline',
      description:
        'Start with a blank workflow that enrolls and is triggered off sales pipeline item',
      output: SALES_DEAL_TRIGGER_OUTPUT,
      actionInputs: DEAL_ACTION_INPUTS,
      setPropertyTargets: SALES_DEAL_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'sales',
      collectionName: 'deals',
      relationType: 'probability',
      icon: 'IconPigMoney',
      label: 'Deal reaches stage probability',
      description:
        'Start this workflow when a deal moves to a stage with the selected probability.',
      isCustom: true,
      reEnrollable: true,
      output: SALES_DEAL_TRIGGER_OUTPUT,
      actionInputs: DEAL_ACTION_INPUTS,
      setPropertyTargets: SALES_DEAL_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'sales',
      collectionName: 'deals',
      relationType: 'stageChanged',
      icon: 'IconPigMoney',
      label: 'Deal stage changed',
      description:
        'Start this workflow when a deal moves from one stage to another.',
      isCustom: true,
      reEnrollable: true,
      output: SALES_DEAL_TRIGGER_OUTPUT,
      actionInputs: DEAL_ACTION_INPUTS,
      setPropertyTargets: SALES_DEAL_SET_PROPERTY_TARGETS,
    },
  ],
  actions: [
    {
      moduleName: 'sales',
      collectionName: 'deals',
      method: 'create',
      icon: 'IconPigMoney',
      label: 'Create deal',
      description: 'Create deal',
      // The deal it creates gets an owner, so the run needs someone to act for.
      requiresActor: true,
      isTargetSource: true,
      targetSourceType: 'sales:sales.deal',
      allowTargetFromActions: true,
      setPropertyTargets: SALES_DEAL_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'sales',
      collectionName: 'checklist',
      method: 'create',
      icon: 'IconPigMoney',
      label: 'Create sales checklist',
      description: 'Create sales checklist',
      isAvailable: true,
      allowTargetFromActions: true,
    },
  ],
  findObjectTargets: SALES_FIND_OBJECT_TARGETS,
  setPropertyTargets: [
    {
      label: 'Customer deals',
      type: 'sales:sales.deals',
      sourceType: 'core:contacts.customers',
      source: 'relation',
      cardinality: 'many',
      relation: {
        contentType: 'core:customer',
        relatedContentType: 'sales:deal',
      },
    },
    {
      label: 'Company deals',
      type: 'sales:sales.deals',
      sourceType: 'core:contacts.companies',
      source: 'relation',
      cardinality: 'many',
      relation: {
        contentType: 'core:company',
        relatedContentType: 'sales:deal',
      },
    },
  ],
};
