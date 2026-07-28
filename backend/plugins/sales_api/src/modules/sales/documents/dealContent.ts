import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { generateProducts } from '~/modules/sales/utils';
import { buildTableBlock, replaceBlocks } from './replaceBlocks';

const TABLE_ATTRIBUTES = [
  'productsInfo',
  'allProductsInfo',
  'productCategoryInfo',
  'servicesInfo',
];

const getPath = (obj: any, path?: string) => {
  if (!obj || !path) return undefined;
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
};

const formatDate = (value: any, withTime = false): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  const iso = date.toISOString();
  return withTime ? iso.slice(0, 16).replace('T', ' ') : iso.slice(0, 10);
};

const formatNumber = (value: number): string =>
  (Math.round((value || 0) * 100) / 100).toLocaleString('en-US');

const formatAmounts = (map: Record<string, number>): string => {
  const entries = Object.entries(map).filter(([, amount]) => amount);
  if (!entries.length) return '0';
  return entries
    .map(([currency, amount]) => `${formatNumber(amount)} ${currency}`)
    .join(', ');
};

const addToMap = (
  map: Record<string, number>,
  currency: string | undefined,
  amount: number | undefined,
) => {
  const key = currency || 'MNT';
  map[key] = (map[key] || 0) + (amount || 0);
};

const joinNames = (
  items: any[],
  pick: (item: any) => string | undefined,
): string => {
  const names = (items || []).map(pick).filter(Boolean);
  return names.length ? names.join(', ') : '-';
};

const userName = (user: any): string =>
  user?.details?.fullName ||
  [user?.details?.firstName, user?.details?.lastName]
    .filter(Boolean)
    .join(' ') ||
  user?.email ||
  user?.username ||
  '';

const customerName = (customer: any): string =>
  [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') ||
  customer?.primaryEmail ||
  customer?.primaryPhone ||
  '';

type DealReplacer = {
  attrMap: Record<string, string>;
  tables: Record<string, string[][]>;
  deal: any;
};

export const buildDealReplacer = async (
  models: IModels,
  subdomain: string,
  deal: any,
): Promise<DealReplacer> => {
  const attrMap: Record<string, string> = {};
  const tables: Record<string, string[][]> = {};

  const stage = deal.stageId
    ? await models.Stages.findOne({ _id: deal.stageId }).lean()
    : null;
  attrMap.stageName = stage?.name || '-';

  let brandName = '-';
  if (stage?.pipelineId) {
    const pipeline = await models.Pipelines.findOne({
      _id: stage.pipelineId,
    }).lean();
    if (pipeline?.boardId) {
      const board = await models.Boards.findOne({
        _id: pipeline.boardId,
      }).lean();
      brandName = board?.name || '-';
    }
  }
  attrMap.brandName = brandName;

  if (deal.assignedUserIds?.length) {
    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: { query: { _id: { $in: deal.assignedUserIds } } },
      defaultValue: [],
    });
    attrMap.assignedUsers = joinNames(users, userName);
  } else {
    attrMap.assignedUsers = '-';
  }

  if (deal.labelIds?.length) {
    const labels = await models.PipelineLabels.find({
      _id: { $in: deal.labelIds },
    }).lean();
    attrMap.labels = joinNames(labels, (label) => label?.name);
  } else {
    attrMap.labels = '-';
  }

  let customerIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'sales:deal',
      contentId: deal._id,
      relatedContentType: 'core:customer',
    },
    defaultValue: [],
  });

  if (!customerIds?.length && deal.customerIds?.length) {
    customerIds = deal.customerIds;
  }

  let customers: any[] = [];
  if (customerIds?.length) {
    customers = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findActiveCustomers',
      input: {
        query: { _id: { $in: customerIds } },
        fields: {
          _id: 1,
          code: 1,
          firstName: 1,
          lastName: 1,
          primaryEmail: 1,
          primaryPhone: 1,
        },
      },
      defaultValue: [],
    });
  }
  attrMap.customers = joinNames(customers, customerName);

  const primaryCustomer =
    (customers || []).find(
      (customer) => customer?.code && /^\d{8}$/.test(customer.code),
    ) || (customers || [])[0];
  attrMap['customers.primaryPhone'] = primaryCustomer?.primaryPhone || '-';
  attrMap['customers.primaryEmail'] = primaryCustomer?.primaryEmail || '-';

  let companyIds: string[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType: 'sales:deal',
      contentId: deal._id,
      relatedContentType: 'core:company',
    },
    defaultValue: [],
  });

  if (!companyIds?.length && deal.companyIds?.length) {
    companyIds = deal.companyIds;
  }

  if (companyIds?.length) {
    const companies = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findActiveCompanies',
      input: {
        query: { _id: { $in: companyIds } },
        fields: { _id: 1, primaryName: 1, code: 1 },
      },
      defaultValue: [],
    });
    attrMap.companies = joinNames(
      companies,
      (company) => company?.primaryName || company?.code,
    );
  } else {
    attrMap.companies = '-';
  }

  const enriched = await generateProducts(subdomain, deal.productsData);

  const productRows: string[][] = [
    ['#', 'Name', 'Quantity', 'Unit price', 'Amount', 'Currency'],
  ];
  const serviceRows: string[][] = [
    ['#', 'Name', 'Quantity', 'Unit price', 'Amount', 'Currency'],
  ];

  const totalAmount: Record<string, number> = {};
  const productAmount: Record<string, number> = {};
  const serviceAmount: Record<string, number> = {};
  const vatAmount: Record<string, number> = {};
  const discountAmount: Record<string, number> = {};
  const categoryMap: Record<
    string,
    { name: string; quantity: number; amount: number; currency: string }
  > = {};

  let productIndex = 0;
  let serviceIndex = 0;
  let hasDiscountPercent = false;
  let hasDiscountAmount = false;

  for (const item of enriched) {
    const product = item.product || {};
    const isService = product.type === 'service';
    const name = product.name || item.name || '-';
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const amount = item.amount || 0;
    const currency = item.currency || 'MNT';

    addToMap(totalAmount, currency, amount);
    addToMap(vatAmount, currency, item.tax);
    addToMap(discountAmount, currency, item.discount);

    if ((item.discountPercent || 0) > 0) hasDiscountPercent = true;
    if ((item.discount || 0) > 0) hasDiscountAmount = true;

    if (isService) {
      addToMap(serviceAmount, currency, amount);
      serviceRows.push([
        String(++serviceIndex),
        name,
        formatNumber(quantity),
        formatNumber(unitPrice),
        formatNumber(amount),
        currency,
      ]);
    } else {
      addToMap(productAmount, currency, amount);
      productRows.push([
        String(++productIndex),
        name,
        formatNumber(quantity),
        formatNumber(unitPrice),
        formatNumber(amount),
        currency,
      ]);

      const categoryId = product.categoryId || 'uncategorized';
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          name: '',
          quantity: 0,
          amount: 0,
          currency,
        };
      }
      categoryMap[categoryId].quantity += quantity;
      categoryMap[categoryId].amount += amount;
    }
  }

  const allProductRows: string[][] = [
    ['#', 'Name', 'Quantity', 'Unit price', 'Amount', 'Currency'],
  ];
  let allIndex = 0;
  for (const item of enriched) {
    const product = item.product || {};
    allProductRows.push([
      String(++allIndex),
      product.name || item.name || '-',
      formatNumber(item.quantity || 0),
      formatNumber(item.unitPrice || 0),
      formatNumber(item.amount || 0),
      item.currency || 'MNT',
    ]);
  }

  const categoryIds = Object.keys(categoryMap).filter(
    (id) => id !== 'uncategorized',
  );
  if (categoryIds.length) {
    const categories = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'productCategories',
      action: 'find',
      input: { query: { _id: { $in: categoryIds } } },
      defaultValue: [],
    });
    for (const id of categoryIds) {
      const category = (categories || []).find((c: any) => c._id === id);
      categoryMap[id].name = category?.name || '-';
    }
  }
  if (categoryMap.uncategorized) {
    categoryMap.uncategorized.name = 'Uncategorized';
  }

  const categoryRows: string[][] = [
    ['Category', 'Quantity', 'Amount', 'Currency'],
  ];
  for (const { name, quantity, amount, currency } of Object.values(
    categoryMap,
  )) {
    categoryRows.push([
      name,
      formatNumber(quantity),
      formatNumber(amount),
      currency,
    ]);
  }

  tables.productsInfo = productRows;
  tables.allProductsInfo = allProductRows;
  tables.servicesInfo = serviceRows;
  tables.productCategoryInfo = categoryRows;

  const totalWithoutVat: Record<string, number> = {};
  for (const [currency, amount] of Object.entries(totalAmount)) {
    totalWithoutVat[currency] = amount - (vatAmount[currency] || 0);
  }

  attrMap.totalAmount = formatAmounts(totalAmount);
  attrMap.productTotalAmount = formatAmounts(productAmount);
  attrMap.servicesTotalAmount = formatAmounts(serviceAmount);
  attrMap.totalAmountVat = formatAmounts(vatAmount);
  attrMap.totalAmountAfterTaxVat = formatAmounts(totalAmount);
  attrMap.totalAmountWithoutVat = formatAmounts(totalWithoutVat);
  attrMap.discount = formatAmounts(discountAmount);
  attrMap.discountType = hasDiscountPercent ? '%' : hasDiscountAmount ? 'amount' : '-';

  const rawPayments = deal.paymentsData;
  const paymentsEntries: Array<[string, any]> = Array.isArray(rawPayments)
    ? (rawPayments as any[]).map((p: any, i: number) => [p?.kind || String(i), p])
    : Object.entries((rawPayments || {}) as Record<string, any>);

  let cash = 0;
  let nonCash = 0;
  for (const [kind, value] of paymentsEntries) {
    const amount =
      typeof value === 'number' ? value : Number(value?.amount) || 0;
    if (/cash/i.test(kind) && !/non/i.test(kind)) {
      cash += amount;
    } else {
      nonCash += amount;
    }
  }
  attrMap.paymentCash = formatNumber(cash);
  attrMap.paymentNonCash = formatNumber(nonCash);

  attrMap.now = formatDate(new Date(), true);
  attrMap.createdAt = formatDate(deal.createdAt);
  attrMap.closeDate = formatDate(deal.closeDate);
  attrMap.startDate = formatDate(deal.startDate);

  return { attrMap, tables, deal };
};

export const replaceDealContent = async ({
  models,
  subdomain,
  replacerIds,
  content,
}: {
  models: IModels;
  subdomain: string;
  replacerIds: string[];
  content: string;
}): Promise<string[]> => {
  if (!content) {
    console.warn('[deal-document] replaceContent called with empty content');
    return [];
  }

  const deals = await models.Deals.find({ _id: { $in: replacerIds } }).lean();

  if (!deals.length) {
    console.warn(
      `[deal-document] no deals matched replacerIds ${JSON.stringify(
        replacerIds,
      )}`,
    );
    return [];
  }

  const replacedContents: string[] = [];

  for (const deal of deals) {
    const { attrMap, tables } = await buildDealReplacer(
      models,
      subdomain,
      deal,
    );

    const replacement = (_replacer: any, path?: string) => {
      if (!path) return '-';
      if (path in attrMap) return attrMap[path];

      const value = getPath(deal, path);
      if (value == null) return '-';
      if (value instanceof Date) return formatDate(value);
      if (typeof value === 'number') return formatNumber(value);
      if (Array.isArray(value)) return value.join(', ');
      return String(value);
    };

    const transform = (block: any) => {
      const attr = block?.props?.value;
      if (attr && TABLE_ATTRIBUTES.includes(attr)) {
        return buildTableBlock(tables[attr] || []);
      }
      return undefined;
    };

    replacedContents.push(
      replaceBlocks({ replacer: deal, content, replacement, transform }),
    );
  }

  return replacedContents;
};
