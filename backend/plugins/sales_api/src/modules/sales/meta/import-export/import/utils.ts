import { IDeal, IProductData } from '~/modules/sales/@types';

const listSeparators = /[,;|\n]/;

export const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value === null || value === undefined) {
    return [];
  }

  return String(value)
    .split(listSeparators)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseProductsData = (value: unknown): IProductData[] | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = typeof value === 'string' ? JSON.parse(value) : value;

  if (!Array.isArray(parsed)) {
    throw new Error('Products JSON must be an array');
  }

  return parsed.map((productData) => {
    if (!productData?.productId) {
      throw new Error('Every product row must include productId');
    }

    return {
      ...productData,
      quantity: parseNumber(productData.quantity) ?? 1,
      unitPrice: parseNumber(productData.unitPrice) ?? 0,
      globalUnitPrice: parseNumber(productData.globalUnitPrice) ?? 0,
      unitPricePercent: parseNumber(productData.unitPricePercent) ?? 0,
      amount: parseNumber(productData.amount),
      tickUsed: Boolean(productData.tickUsed),
      isVatApplied: Boolean(productData.isVatApplied),
    };
  });
};

export const buildDealImportDoc = (row: any, userId: string): IDeal => {
  const name = String(row.name || '').trim();
  const stageId = String(row.stageId || '').trim();

  if (!name) {
    throw new Error('Name is required');
  }

  if (!stageId) {
    throw new Error('Stage ID is required');
  }

  const productsData = parseProductsData(row.productsData);

  return {
    name,
    stageId,
    number: row.number ? String(row.number).trim() : undefined,
    description: row.description,
    priority: row.priority,
    startDate: parseDate(row.startDate),
    closeDate: parseDate(row.closeDate),
    assignedUserIds: parseList(row.assignedUserIds),
    labelIds: parseList(row.labelIds),
    tagIds: parseList(row.tagIds),
    branchIds: parseList(row.branchIds),
    departmentIds: parseList(row.departmentIds),
    customerIds: parseList(row.customerIds),
    companyIds: parseList(row.companyIds),
    productsData,
    initialStageId: stageId,
    userId,
    modifiedBy: userId,
  };
};
